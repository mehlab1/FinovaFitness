import pool from '../config/database.js';

class FacilityController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.generateSlots = this.generateSlots.bind(this);
    this.generateSlotsForDay = this.generateSlotsForDay.bind(this);
    this.isPeakHours = this.isPeakHours.bind(this);
  }

  // Get all facilities with analytics
  async getAllFacilities(req, res) {
    try {
      const query = `
        SELECT 
          f.*,
          fp.base_price,
          fp.peak_hours_start,
          fp.peak_hours_end,
          fp.peak_price_multiplier,
          fp.member_discount_percentage,
          cp.cancellation_hours,
          cp.refund_percentage,
          COALESCE(fa.total_bookings, 0) as total_bookings,
          COALESCE(fa.total_revenue, 0) as total_revenue,
          COALESCE(fa.average_utilization_percentage, 0) as utilization_percentage
        FROM facilities f
        LEFT JOIN facility_pricing fp ON f.id = fp.facility_id
        LEFT JOIN cancellation_policies cp ON f.id = cp.facility_id
        LEFT JOIN (
          SELECT 
            facility_id,
            SUM(total_bookings) as total_bookings,
            SUM(total_revenue) as total_revenue,
            AVG(average_utilization_percentage) as average_utilization_percentage
          FROM facility_analytics
          WHERE date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY facility_id
        ) fa ON f.id = fa.facility_id
        WHERE f.is_active = true
        ORDER BY f.name
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get facility by ID
  async getFacilityById(req, res) {
    try {
      const { id } = req.params;
      const query = `
        SELECT 
          f.*,
          fp.base_price,
          fp.peak_hours_start,
          fp.peak_hours_end,
          fp.peak_price_multiplier,
          fp.member_discount_percentage,
          cp.cancellation_hours,
          cp.refund_percentage
        FROM facilities f
        LEFT JOIN facility_pricing fp ON f.id = fp.facility_id
        LEFT JOIN cancellation_policies cp ON f.id = cp.facility_id
        WHERE f.id = $1 AND f.is_active = true
      `;
      
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Facility not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching facility:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new facility
  async createFacility(req, res) {
    try {
      const {
        name,
        description,
        category,
        default_duration_minutes,
        max_capacity,
        location,
        image_url,
        base_price,
        peak_hours_start,
        peak_hours_end,
        peak_price_multiplier,
        member_discount_percentage,
        cancellation_hours,
        refund_percentage
      } = req.body;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert facility
        const facilityQuery = `
          INSERT INTO facilities (name, description, category, default_duration_minutes, max_capacity, location, image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `;
        const facilityResult = await client.query(facilityQuery, [
          name, description, category, default_duration_minutes, max_capacity, location, image_url
        ]);
        
        const facilityId = facilityResult.rows[0].id;

        // Insert pricing
        const pricingQuery = `
          INSERT INTO facility_pricing (facility_id, base_price, peak_hours_start, peak_hours_end, peak_price_multiplier, member_discount_percentage)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(pricingQuery, [
          facilityId, base_price, peak_hours_start, peak_hours_end, peak_price_multiplier, member_discount_percentage
        ]);

        // Insert cancellation policy
        const policyQuery = `
          INSERT INTO cancellation_policies (facility_id, cancellation_hours, refund_percentage)
          VALUES ($1, $2, $3)
        `;
        await client.query(policyQuery, [facilityId, cancellation_hours, refund_percentage]);

        await client.query('COMMIT');
        
        res.status(201).json({ 
          message: 'Facility created successfully', 
          facility_id: facilityId 
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating facility:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update facility
  async updateFacility(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        category,
        default_duration_minutes,
        max_capacity,
        location,
        image_url,
        base_price,
        peak_hours_start,
        peak_hours_end,
        peak_price_multiplier,
        member_discount_percentage,
        cancellation_hours,
        refund_percentage
      } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update facility
        const facilityQuery = `
          UPDATE facilities 
          SET name = $1, description = $2, category = $3, default_duration_minutes = $4, 
              max_capacity = $5, location = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
        `;
        await client.query(facilityQuery, [
          name, description, category, default_duration_minutes, max_capacity, location, image_url, id
        ]);

        // Update pricing
        const pricingQuery = `
          UPDATE facility_pricing 
          SET base_price = $1, peak_hours_start = $2, peak_hours_end = $3, 
              peak_price_multiplier = $4, member_discount_percentage = $5, updated_at = CURRENT_TIMESTAMP
          WHERE facility_id = $6
        `;
        await client.query(pricingQuery, [
          base_price, peak_hours_start, peak_hours_end, peak_price_multiplier, member_discount_percentage, id
        ]);

        // Update cancellation policy
        const policyQuery = `
          UPDATE cancellation_policies 
          SET cancellation_hours = $1, refund_percentage = $2, updated_at = CURRENT_TIMESTAMP
          WHERE facility_id = $3
        `;
        await client.query(policyQuery, [cancellation_hours, refund_percentage, id]);

        await client.query('COMMIT');
        
        res.json({ message: 'Facility updated successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating facility:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete/Deactivate facility
  async deleteFacility(req, res) {
    try {
      const { id } = req.params;
      
      // Soft delete - set is_active to false
      const query = 'UPDATE facilities SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Facility not found' });
      }
      
      res.json({ message: 'Facility deactivated successfully' });
    } catch (error) {
      console.error('Error deleting facility:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get facility schedules
  async getFacilitySchedules(req, res) {
    try {
      const { facilityId } = req.params;
      const query = `
        SELECT * FROM facility_schedules 
        WHERE facility_id = $1 
        ORDER BY day_of_week, start_time
      `;
      
      const result = await pool.query(query, [facilityId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching facility schedules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update facility schedules
  async updateFacilitySchedules(req, res) {
    try {
      const { facilityId } = req.params;
      const { schedules } = req.body; // Array of schedule objects

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Delete existing schedules
        await client.query('DELETE FROM facility_schedules WHERE facility_id = $1', [facilityId]);

        // Insert new schedules
        for (const schedule of schedules) {
          const { day_of_week, start_time, end_time, is_available } = schedule;
          await client.query(
            'INSERT INTO facility_schedules (facility_id, day_of_week, start_time, end_time, is_available) VALUES ($1, $2, $3, $4, $5)',
            [facilityId, day_of_week, start_time, end_time, is_available]
          );
        }

        await client.query('COMMIT');
        res.json({ message: 'Facility schedules updated successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating facility schedules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate slots for a date range
  async generateSlots(req, res) {
    try {
      const { facilityId } = req.params;
      const { startDate, endDate } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get facility details and pricing
        const facilityQuery = `
          SELECT f.default_duration_minutes, f.max_capacity,
                 fp.base_price, fp.peak_hours_start, fp.peak_hours_end, fp.peak_price_multiplier
          FROM facilities f
          JOIN facility_pricing fp ON f.id = fp.facility_id
          WHERE f.id = $1
        `;
        const facilityResult = await client.query(facilityQuery, [facilityId]);
        
        if (facilityResult.rows.length === 0) {
          return res.status(404).json({ error: 'Facility not found' });
        }

        const facility = facilityResult.rows[0];
        const slots = [];
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
          const dayOfWeek = currentDate.getDay();
          
          // Check if facility is available on this day
          const scheduleQuery = `
            SELECT start_time, end_time FROM facility_schedules 
            WHERE facility_id = $1 AND day_of_week = $2 AND is_available = true
          `;
          const scheduleResult = await client.query(scheduleQuery, [facilityId, dayOfWeek]);
          
          if (scheduleResult.rows.length > 0) {
            for (const schedule of scheduleResult.rows) {
              let currentTime = new Date(`2000-01-01 ${schedule.start_time}`);
              const endTime = new Date(`2000-01-01 ${schedule.end_time}`);
              
              while (currentTime < endTime) {
                const slotEndTime = new Date(currentTime.getTime() + facility.default_duration_minutes * 60000);
                
                if (slotEndTime <= endTime) {
                  const startTimeStr = currentTime.toTimeString().slice(0, 5);
                  const endTimeStr = slotEndTime.toTimeString().slice(0, 5);
                  
                  // Determine slot type and price
                  const isPeakHour = startTimeStr >= facility.peak_hours_start && startTimeStr < facility.peak_hours_end;
                  const slotType = isPeakHour ? 'peak' : 'off_peak';
                  const finalPrice = isPeakHour ? 
                    facility.base_price * facility.peak_price_multiplier : 
                    facility.base_price;

                  slots.push({
                    facility_id: facilityId,
                    date: currentDate.toISOString().split('T')[0],
                    start_time: startTimeStr,
                    end_time: endTimeStr,
                    base_price: facility.base_price,
                    final_price: finalPrice,
                    slot_type: slotType,
                    max_capacity: facility.max_capacity
                  });
                }
                
                currentTime = slotEndTime;
              }
            }
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Insert slots (ignore conflicts for existing slots)
        for (const slot of slots) {
          await client.query(`
            INSERT INTO facility_slots (facility_id, date, start_time, end_time, base_price, final_price, slot_type, max_capacity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (facility_id, date, start_time) DO NOTHING
          `, [slot.facility_id, slot.date, slot.start_time, slot.end_time, slot.base_price, slot.final_price, slot.slot_type, slot.max_capacity]);
        }

        await client.query('COMMIT');
        res.json({ 
          message: 'Slots generated successfully', 
          slots_created: slots.length 
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error generating slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get available slots for a facility
  async getAvailableSlots(req, res) {
    try {
      const { facilityId } = req.params;
      const { date, startDate, endDate } = req.query;

      let query;
      let params;

      if (date) {
        // Single date
        query = `
          SELECT * FROM facility_slots 
          WHERE facility_id = $1 AND date = $2 AND status = 'available'
          ORDER BY start_time
        `;
        params = [facilityId, date];
      } else if (startDate && endDate) {
        // Date range
        query = `
          SELECT * FROM facility_slots 
          WHERE facility_id = $1 AND date BETWEEN $2 AND $3 AND status = 'available'
          ORDER BY date, start_time
        `;
        params = [facilityId, startDate, endDate];
      } else {
        return res.status(400).json({ error: 'Either date or startDate and endDate are required' });
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update slot status (bulk operations)
  async updateSlotStatus(req, res) {
    try {
      const { slotIds, status, reason } = req.body;

      if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
        return res.status(400).json({ error: 'Slot IDs array is required' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update slots
        const updateQuery = `
          UPDATE facility_slots 
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ANY($2)
        `;
        await client.query(updateQuery, [status, slotIds]);

        // If blocking slots, add to exceptions table
        if (status === 'blocked' && reason) {
          for (const slotId of slotIds) {
            const slotQuery = 'SELECT facility_id, date, start_time, end_time FROM facility_slots WHERE id = $1';
            const slotResult = await client.query(slotQuery, [slotId]);
            
            if (slotResult.rows.length > 0) {
              const slot = slotResult.rows[0];
              await client.query(`
                INSERT INTO facility_availability_exceptions (facility_id, date, start_time, end_time, reason)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (facility_id, date, start_time) DO NOTHING
              `, [slot.facility_id, slot.date, slot.start_time, slot.end_time, reason]);
            }
          }
        }

        await client.query('COMMIT');
        res.json({ message: 'Slot status updated successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating slot status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get facility analytics
  async getFacilityAnalytics(req, res) {
    try {
      const { facilityId } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      const query = `
        SELECT 
          date,
          total_slots,
          total_bookings,
          total_revenue,
          peak_hour_bookings,
          off_peak_bookings,
          member_bookings,
          non_member_bookings,
          average_utilization_percentage
        FROM facility_analytics
        WHERE facility_id = $1 AND date BETWEEN $2 AND $3
        ORDER BY date DESC
      `;

      const result = await pool.query(query, [facilityId, start, end]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching facility analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get slots for a specific facility and date
  async getFacilitySlots(req, res) {
    try {
      const { facilityId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }

             const query = `
         SELECT 
           id,
           facility_id,
           date,
           start_time,
           end_time,
           status,
           base_price,
           final_price,
           slot_type,
           max_capacity,
           current_bookings
         FROM facility_slots
         WHERE facility_id = $1 AND date = $2
         ORDER BY start_time
       `;

      const result = await pool.query(query, [facilityId, date]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching facility slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all bookings for admin view
  async getAllBookings(req, res) {
    try {
      const { facilityId, date, status } = req.query;
      
      let query = `
        SELECT 
          fb.*,
          f.name as facility_name,
          u.first_name, u.last_name, u.email, u.role,
          fs.date as slot_date, fs.start_time as slot_start_time, fs.end_time as slot_end_time
        FROM facility_bookings fb
        JOIN facilities f ON fb.facility_id = f.id
        JOIN users u ON fb.user_id = u.id
        JOIN facility_slots fs ON fb.slot_id = fs.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;

      if (facilityId) {
        paramCount++;
        query += ` AND fb.facility_id = $${paramCount}`;
        params.push(facilityId);
      }

      if (date) {
        paramCount++;
        query += ` AND fb.booking_date = $${paramCount}`;
        params.push(date);
      }

      if (status) {
        paramCount++;
        query += ` AND fb.status = $${paramCount}`;
        params.push(status);
      }

      query += ' ORDER BY fb.booking_date DESC, fb.start_time DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Test method binding
  testMethodBinding(req, res) {
    try {
      console.log('Testing method binding...');
      console.log('this context:', this);
      console.log('this.generateSlotsForDay:', this.generateSlotsForDay);
      console.log('this.isPeakHours:', this.isPeakHours);
      
      // Test a simple call
      const testResult = this.isPeakHours('10:00', '09:00', '17:00');
      console.log('Test call result:', testResult);
      
      res.json({
        message: 'Method binding test completed',
        thisContext: 'FacilityController instance',
        methods: {
          generateSlotsForDay: typeof this.generateSlotsForDay,
          isPeakHours: typeof this.isPeakHours
        },
        testCallResult: testResult
      });
    } catch (error) {
      console.error('Method binding test failed:', error);
      res.status(500).json({ error: 'Method binding test failed', details: error.message });
    }
  }

  // Test endpoint to check database connectivity and basic queries
  async testDatabase(req, res) {
    try {
      console.log('Testing database connectivity...');
      
      // Test basic connection
      const testResult = await pool.query('SELECT NOW() as current_time');
      console.log('Database connection test:', testResult.rows[0]);
      
      // Test facilities table
      const facilitiesResult = await pool.query('SELECT COUNT(*) as count FROM facilities');
      console.log('Facilities count:', facilitiesResult.rows[0]);
      
      // Test facility_slots table
      const slotsResult = await pool.query('SELECT COUNT(*) as count FROM facility_slots');
      console.log('Slots count:', slotsResult.rows[0]);
      
      // Test facility_pricing table
      const pricingResult = await pool.query('SELECT COUNT(*) as count FROM facility_pricing');
      console.log('Pricing count:', pricingResult.rows[0]);
      
      // Test method binding
      console.log('Testing method binding...');
      console.log('this.generateSlotsForDay:', this.generateSlotsForDay);
      console.log('this.isPeakHours:', this.isPeakHours);
      
      res.json({
        message: 'Database test completed successfully',
        currentTime: testResult.rows[0].current_time,
        facilitiesCount: facilitiesResult.rows[0].count,
        slotsCount: slotsResult.rows[0].count,
        pricingCount: pricingResult.rows[0].count,
        methodBindingTest: {
          generateSlotsForDay: typeof this.generateSlotsForDay,
          isPeakHours: typeof this.isPeakHours
        }
      });
    } catch (error) {
      console.error('Database test failed:', error);
      res.status(500).json({ error: 'Database test failed', details: error.message });
    }
  }

  // Clear all slots for a facility
  async clearFacilitySlots(req, res) {
    try {
      const { facilityId } = req.params;
      
      console.log(`Clearing all slots for facility ${facilityId}...`);
      
      const result = await pool.query(
        'DELETE FROM facility_slots WHERE facility_id = $1 RETURNING id',
        [facilityId]
      );
      
      console.log(`Cleared ${result.rowCount} slots for facility ${facilityId}`);
      
      res.json({
        message: `Cleared ${result.rowCount} slots successfully`,
        slotsCleared: result.rowCount
      });
    } catch (error) {
      console.error('Error clearing facility slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate slots for a facility over a period
  async generateSlots(req, res) {
    try {
      const { facilityId } = req.params;
      const {
        availableDays,
        openingTime,
        closingTime,
        duration,
        generationPeriod,
        periodType,
        startDate
      } = req.body;

      // Debug logging
      console.log('Received slot generation request:', {
        facilityId,
        availableDays,
        openingTime,
        closingTime,
        duration,
        generationPeriod,
        periodType,
        startDate
      });

      // Validate required fields
      if (!facilityId || !availableDays || availableDays.length === 0 || !openingTime || !closingTime || !duration || !generationPeriod || !periodType || !startDate) {
        console.log('Validation failed. Missing fields:', {
          facilityId: !!facilityId,
          availableDays: !!availableDays,
          availableDaysLength: availableDays?.length,
          openingTime: !!openingTime,
          closingTime: !!closingTime,
          duration: !!duration,
          generationPeriod: !!generationPeriod,
          periodType: !!periodType,
          startDate: !!startDate
        });
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Get facility details
      const facilityResult = await pool.query(
        'SELECT * FROM facilities WHERE id = $1 AND is_active = true',
        [facilityId]
      );

      if (facilityResult.rows.length === 0) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      const facility = facilityResult.rows[0];

      // Get facility pricing
      const pricingResult = await pool.query(
        'SELECT * FROM facility_pricing WHERE facility_id = $1',
        [facilityId]
      );

      const pricing = pricingResult.rows[0] || { base_price: 1000 };

      // Check if there are existing slots for this facility
      const existingSlotsResult = await pool.query(
        'SELECT COUNT(*) as count FROM facility_slots WHERE facility_id = $1',
        [facilityId]
      );
      
      const existingSlotsCount = parseInt(existingSlotsResult.rows[0].count);
      console.log(`Found ${existingSlotsCount} existing slots for facility ${facilityId}`);
      
      if (existingSlotsCount > 0) {
        console.log('Clearing existing slots before generating new ones...');
        await pool.query('DELETE FROM facility_slots WHERE facility_id = $1', [facilityId]);
        console.log('Existing slots cleared successfully');
      }

      // Calculate end date based on period type
      const start = new Date(startDate);
      const periodValue = parseInt(generationPeriod);
      let endDate = new Date(start);

      switch (periodType) {
        case 'days':
          endDate.setDate(start.getDate() + periodValue);
          break;
        case 'weeks':
          endDate.setDate(start.getDate() + (periodValue * 7));
          break;
        case 'months':
          endDate.setMonth(start.getMonth() + periodValue);
          break;
        default:
          return res.status(400).json({ error: 'Invalid period type' });
      }

      // Generate slots for each available day
      const allSlots = [];
      const currentDate = new Date(start);

      console.log(`Generating slots from ${startDate} to ${endDate.toISOString().split('T')[0]}`);
      console.log(`Available days: ${availableDays.join(', ')}`);
      console.log(`Opening time: ${openingTime}, Closing time: ${closingTime}, Duration: ${duration} minutes`);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateString = currentDate.toISOString().split('T')[0];
        
        console.log(`Processing date: ${dateString}, Day of week: ${dayOfWeek}`);
        
        // Check if this day is available
        if (availableDays.includes(dayOfWeek)) {
          console.log(`Date ${dateString} is available (day ${dayOfWeek})`);
          
          // Generate slots for this day
          console.log('About to call generateSlotsForDay, this context:', this);
          console.log('this.generateSlotsForDay:', this.generateSlotsForDay);
          
          const daySlots = this.generateSlotsForDay(
            dateString,
            openingTime,
            closingTime,
            duration,
            facility,
            pricing
          );
          
          console.log(`Generated ${daySlots.length} slots for ${dateString}`);
          allSlots.push(...daySlots);
        } else {
          console.log(`Date ${dateString} is not available (day ${dayOfWeek})`);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`Total slots generated: ${allSlots.length}`);

      // Insert all slots into database
      if (allSlots.length > 0) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

                     // Insert new slots
           for (const slot of allSlots) {
             await client.query(`
               INSERT INTO facility_slots (
                 facility_id, date, start_time, end_time,
                 status, base_price, final_price, slot_type, max_capacity, current_bookings
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             `, [
               slot.facility_id,
               slot.date,
               slot.start_time,
               slot.end_time,
               slot.status,
               slot.base_price,
               slot.final_price,
               slot.slot_type,
               slot.max_capacity,
               slot.current_bookings
             ]);
           }

          await client.query('COMMIT');

          res.json({
            message: 'Slots generated successfully',
            slotsGenerated: allSlots.length,
            dateRange: {
              start: startDate,
              end: endDate.toISOString().split('T')[0]
            },
            facility: facility.name
          });

        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } else {
        res.json({
          message: 'No slots generated',
          slotsGenerated: 0,
          reason: 'No available days in the selected period'
        });
      }

    } catch (error) {
      console.error('Error generating slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper method to generate slots for a single day
  generateSlotsForDay(date, startTime, endTime, duration, facility, pricing) {
    console.log(`generateSlotsForDay called with: date=${date}, startTime=${startTime}, endTime=${endTime}, duration=${duration}`);
    console.log(`Facility:`, facility);
    console.log(`Pricing:`, pricing);
    
    const slots = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    console.log(`Current time: ${currentTime}, End time: ${endDateTime}`);

    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000).toTimeString().slice(0, 5);
      
      // Check if slot end time exceeds closing time
      if (new Date(`2000-01-01T${slotEnd}`) > endDateTime) {
        console.log(`Slot end time ${slotEnd} exceeds closing time ${endTime}, breaking`);
        break;
      }

      // Calculate final price based on peak/off-peak and member discount
      let finalPrice = pricing.base_price;
      
      // Check if it's peak hours
      const isPeakHours = this.isPeakHours(slotStart, pricing.peak_hours_start, pricing.peak_hours_end);
      if (isPeakHours && pricing.peak_price_multiplier) {
        finalPrice = finalPrice * pricing.peak_price_multiplier;
      }

             const slot = {
         facility_id: facility.id,
         date,
         start_time: slotStart,
         end_time: slotEnd,
         status: 'available',
         base_price: pricing.base_price,
         final_price: Math.round(finalPrice),
         slot_type: 'regular',
         max_capacity: facility.max_capacity,
         current_bookings: 0
       };

      console.log(`Generated slot:`, slot);
      slots.push(slot);

      currentTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    }

    console.log(`Total slots generated for ${date}: ${slots.length}`);
    return slots;
  }

  // Helper method to check if a time is within peak hours
  isPeakHours(time, peakStart, peakEnd) {
    console.log(`isPeakHours called with: time=${time}, peakStart=${peakStart}, peakEnd=${peakEnd}`);
    
    if (!peakStart || !peakEnd) {
      console.log(`No peak hours defined, returning false`);
      return false;
    }
    
    const timeValue = new Date(`2000-01-01T${time}`).getTime();
    const peakStartValue = new Date(`2000-01-01T${peakStart}`).getTime();
    const peakEndValue = new Date(`2000-01-01T${peakEnd}`).getTime();
    
    const isPeak = timeValue >= peakStartValue && timeValue <= peakEndValue;
    console.log(`Time ${time} (${timeValue}) is ${isPeak ? 'within' : 'outside'} peak hours ${peakStart}-${peakEnd} (${peakStartValue}-${peakEndValue})`);
    
    return isPeak;
  }
}

export default new FacilityController();
