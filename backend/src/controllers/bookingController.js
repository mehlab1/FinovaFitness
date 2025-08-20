import pool from '../config/database.js';

class BookingController {
  // Get available facilities for users
  async getAvailableFacilities(req, res) {
    try {
      const query = `
        SELECT 
          f.*,
          fp.base_price,
          fp.peak_hours_start,
          fp.peak_hours_end,
          fp.peak_price_multiplier,
          fp.member_discount_percentage
        FROM facilities f
        JOIN facility_pricing fp ON f.id = fp.facility_id
        WHERE f.is_active = true
        ORDER BY f.name
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching available facilities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get available slots for a facility
  async getAvailableSlots(req, res) {
    try {
      const { facilityId } = req.params;
      const { date, startDate, endDate } = req.query;
      const userId = req.user?.id;

      let query;
      let params;

      if (date) {
        // Single date
        query = `
          SELECT 
            fs.*,
            f.name as facility_name,
            f.max_capacity,
            f.default_duration_minutes
          FROM facility_slots fs
          JOIN facilities f ON fs.facility_id = f.id
          WHERE fs.facility_id = $1 AND fs.date = $2 AND fs.status = 'available'
          ORDER BY fs.start_time
        `;
        params = [facilityId, date];
      } else if (startDate && endDate) {
        // Date range
        query = `
          SELECT 
            fs.*,
            f.name as facility_name,
            f.max_capacity,
            f.default_duration_minutes
          FROM facility_slots fs
          JOIN facilities f ON fs.facility_id = f.id
          WHERE fs.facility_id = $1 AND fs.date BETWEEN $2 AND $3 AND fs.status = 'available'
          ORDER BY fs.date, fs.start_time
        `;
        params = [facilityId, startDate, endDate];
      } else {
        return res.status(400).json({ error: 'Either date or startDate and endDate are required' });
      }

      const result = await pool.query(query, params);
      
      // Calculate member pricing if user is logged in
      if (userId) {
        const userQuery = 'SELECT role FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        const isMember = userResult.rows[0]?.role === 'member';
        
        if (isMember) {
          result.rows.forEach(slot => {
            slot.member_price = slot.final_price * (1 - 0.15); // 15% member discount
          });
        }
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Book a facility slot
  async bookSlot(req, res) {
    try {
      const { slotId, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to book' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if slot is still available
        const slotQuery = `
          SELECT fs.*, f.name as facility_name, f.max_capacity
          FROM facility_slots fs
          JOIN facilities f ON fs.facility_id = f.id
          WHERE fs.id = $1 AND fs.status = 'available'
        `;
        const slotResult = await client.query(slotQuery, [slotId]);
        
        if (slotResult.rows.length === 0) {
          return res.status(400).json({ error: 'Slot is no longer available' });
        }

        const slot = slotResult.rows[0];
        
        console.log('Slot data:', {
          slotId: slot.id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          facility_id: slot.facility_id
        });

        // Check if user already has a booking for this time (prevent double-booking)
        const existingBookingQuery = `
          SELECT id, slot_id, booking_date, start_time FROM facility_bookings 
          WHERE user_id = $1 AND booking_date = $2 AND start_time = $3 AND status IN ('confirmed', 'pending')
        `;
        const existingBookingResult = await client.query(existingBookingQuery, [
          userId, slot.date, slot.start_time
        ]);

        console.log('Existing bookings query result:', {
          userId,
          date: slot.date,
          start_time: slot.start_time,
          foundBookings: existingBookingResult.rows
        });

        if (existingBookingResult.rows.length > 0) {
          console.log('Existing booking found:', existingBookingResult.rows[0]);
          console.log('Attempting to book slot:', { slotId, date: slot.date, start_time: slot.start_time });
          return res.status(400).json({ error: 'You already have a booking for this time' });
        }

        // Check capacity
        if (slot.current_bookings >= slot.max_capacity) {
          return res.status(400).json({ error: 'Slot is at maximum capacity' });
        }

        // Get user details for pricing
        const userQuery = 'SELECT role FROM users WHERE id = $1';
        const userResult = await client.query(userQuery, [userId]);
        const isMember = userResult.rows[0]?.role === 'member';
        
        // Calculate final price
        const finalPrice = isMember ? slot.final_price * 0.85 : slot.final_price;

        // Create booking
        const bookingQuery = `
          INSERT INTO facility_bookings (user_id, slot_id, facility_id, booking_date, start_time, end_time, price_paid, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `;
        const bookingResult = await client.query(bookingQuery, [
          userId, slotId, slot.facility_id, slot.date, slot.start_time, slot.end_time, finalPrice, notes
        ]);

        // Update slot capacity
        await client.query(`
          UPDATE facility_slots 
          SET current_bookings = current_bookings + 1, 
              status = CASE WHEN current_bookings + 1 >= max_capacity THEN 'booked' ELSE 'available' END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [slotId]);

        // Update analytics
        await client.query(`
          INSERT INTO facility_analytics (facility_id, date, total_bookings, total_revenue, 
                                        peak_hour_bookings, off_peak_bookings, member_bookings, non_member_bookings)
          VALUES ($1, $2, 1, $3, 
                  CASE WHEN $4 = 'peak' THEN 1 ELSE 0 END,
                  CASE WHEN $4 = 'off_peak' THEN 1 ELSE 0 END,
                  CASE WHEN $5 = true THEN 1 ELSE 0 END,
                  CASE WHEN $5 = false THEN 1 ELSE 0 END)
          ON CONFLICT (facility_id, date) 
          DO UPDATE SET 
            total_bookings = facility_analytics.total_bookings + 1,
            total_revenue = facility_analytics.total_revenue + EXCLUDED.total_revenue,
            peak_hour_bookings = facility_analytics.peak_hour_bookings + EXCLUDED.peak_hour_bookings,
            off_peak_bookings = facility_analytics.off_peak_bookings + EXCLUDED.off_peak_bookings,
            member_bookings = facility_analytics.member_bookings + EXCLUDED.member_bookings,
            non_member_bookings = facility_analytics.non_member_bookings + EXCLUDED.non_member_bookings
        `, [slot.facility_id, slot.date, finalPrice, slot.slot_type, isMember]);

        await client.query('COMMIT');
        
        res.status(201).json({ 
          message: 'Booking created successfully', 
          booking_id: bookingResult.rows[0].id,
          facility_name: slot.facility_name,
          date: slot.date,
          time: `${slot.start_time} - ${slot.end_time}`,
          price: finalPrice
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's bookings
  async getUserBookings(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User must be logged in' });
      }

      const query = `
        SELECT 
          fb.*,
          f.name as facility_name,
          f.location,
          fs.date as slot_date,
          fs.start_time as slot_start_time,
          fs.end_time as slot_end_time
        FROM facility_bookings fb
        JOIN facilities f ON fb.facility_id = f.id
        JOIN facility_slots fs ON fb.slot_id = fs.id
        WHERE fb.user_id = $1
        ORDER BY fb.booking_date DESC, fb.start_time DESC
      `;

      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Cancel a booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { cancellationReason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User must be logged in' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get booking details
        const bookingQuery = `
          SELECT fb.*, fs.id as slot_id, fs.facility_id, fs.date, fs.start_time, fs.end_time
          FROM facility_bookings fb
          JOIN facility_slots fs ON fb.slot_id = fs.id
          WHERE fb.id = $1 AND fb.user_id = $2
        `;
        const bookingResult = await client.query(bookingQuery, [bookingId, userId]);
        
        if (bookingResult.rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookingResult.rows[0];

        // Check cancellation policy
        const policyQuery = `
          SELECT cancellation_hours, refund_percentage 
          FROM cancellation_policies 
          WHERE facility_id = $1
        `;
        const policyResult = await client.query(policyQuery, [booking.facility_id]);
        const policy = policyResult.rows[0] || { cancellation_hours: 24, refund_percentage: 100 };

        const bookingDateTime = new Date(`${booking.date} ${booking.start_time}`);
        const currentDateTime = new Date();
        const hoursUntilBooking = (bookingDateTime - currentDateTime) / (1000 * 60 * 60);

        if (hoursUntilBooking < policy.cancellation_hours) {
          return res.status(400).json({ 
            error: `Cancellation must be made at least ${policy.cancellation_hours} hours before the booking` 
          });
        }

        // Update booking status
        await client.query(`
          UPDATE facility_bookings 
          SET status = 'cancelled', cancellation_reason = $1, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [cancellationReason, bookingId]);

        // Update slot capacity
        await client.query(`
          UPDATE facility_slots 
          SET current_bookings = GREATEST(current_bookings - 1, 0),
              status = CASE WHEN current_bookings - 1 < max_capacity THEN 'available' ELSE 'booked' END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [booking.slot_id]);

        // Update analytics
        await client.query(`
          UPDATE facility_analytics 
          SET total_bookings = GREATEST(total_bookings - 1, 0),
              total_revenue = GREATEST(total_revenue - $1, 0)
          WHERE facility_id = $2 AND date = $3
        `, [booking.price_paid, booking.facility_id, booking.date]);

        await client.query('COMMIT');
        
        res.json({ 
          message: 'Booking cancelled successfully',
          refund_amount: booking.price_paid * (policy.refund_percentage / 100)
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Join waitlist
  async joinWaitlist(req, res) {
    try {
      const { facilityId, preferredDate, preferredStartTime, preferredEndTime } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to join waitlist' });
      }

      // Check if user already has a waitlist entry for this facility and date
      const existingQuery = `
        SELECT id FROM facility_waitlist 
        WHERE user_id = $1 AND facility_id = $2 AND preferred_date = $3 AND status = 'waiting'
      `;
      const existingResult = await pool.query(existingQuery, [userId, facilityId, preferredDate]);
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'You are already on the waitlist for this facility and date' });
      }

      // Create waitlist entry
      const query = `
        INSERT INTO facility_waitlist (user_id, facility_id, preferred_date, preferred_start_time, preferred_end_time)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        userId, facilityId, preferredDate, preferredStartTime, preferredEndTime
      ]);

      res.status(201).json({ 
        message: 'Successfully joined waitlist',
        waitlist_id: result.rows[0].id
      });
    } catch (error) {
      console.error('Error joining waitlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's waitlist entries
  async getUserWaitlist(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User must be logged in' });
      }

      const query = `
        SELECT 
          fw.*,
          f.name as facility_name,
          f.location
        FROM facility_waitlist fw
        JOIN facilities f ON fw.facility_id = f.id
        WHERE fw.user_id = $1
        ORDER BY fw.preferred_date DESC, fw.created_at DESC
      `;

      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user waitlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Remove from waitlist
  async removeFromWaitlist(req, res) {
    try {
      const { waitlistId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User must be logged in' });
      }

      const query = `
        DELETE FROM facility_waitlist 
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await pool.query(query, [waitlistId, userId]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Waitlist entry not found' });
      }

      res.json({ message: 'Removed from waitlist successfully' });
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get waitlist for a facility (admin only)
  async getFacilityWaitlist(req, res) {
    try {
      const { facilityId } = req.params;
      const { date } = req.query;

      let query = `
        SELECT 
          fw.*,
          u.first_name, u.last_name, u.email, u.role
        FROM facility_waitlist fw
        JOIN users u ON fw.user_id = u.id
        WHERE fw.facility_id = $1
      `;
      
      const params = [facilityId];

      if (date) {
        query += ' AND fw.preferred_date = $2';
        params.push(date);
      }

      query += ' ORDER BY fw.priority DESC, fw.created_at ASC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching facility waitlist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new BookingController();
