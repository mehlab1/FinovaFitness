# 💬 Nutritionist-Member Chat System

## Overview

The Chat System enables real-time communication between nutritionists and members for approved diet plan requests. This system allows for collaborative diet plan development, questions, and ongoing support throughout the nutrition journey.

## 🗄️ Database Schema

### `chat_messages` Table

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    diet_plan_request_id INTEGER REFERENCES diet_plan_requests(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('member', 'nutritionist')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'diet_plan', 'file')),
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_chat_messages_request_id ON chat_messages(diet_plan_request_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### Fields Description

- **`id`**: Unique message identifier
- **`diet_plan_request_id`**: Links to the specific diet plan request
- **`sender_id`**: User ID of the message sender
- **`sender_type`**: Either 'member' or 'nutritionist'
- **`message`**: The actual message content
- **`message_type`**: Type of message ('text', 'diet_plan', 'file')
- **`file_url`**: Optional URL for file attachments
- **`is_read`**: Tracks if the message has been read
- **`created_at`**: Timestamp of message creation

## 🔧 Backend Implementation

### Chat Controller (`backend/src/controllers/chatController.js`)

#### Functions:

1. **`getChatMessages(requestId)`**: Fetch all messages for a specific request
2. **`sendMessage(requestId, message, messageType, fileUrl)`**: Send a new message
3. **`getUnreadCount()`**: Get count of unread messages for current user
4. **`getChatSummary()`**: Get list of active chats with summary info

### Chat Routes (`backend/src/routes/chat.js`)

- `GET /api/chat/messages/:requestId` - Get chat messages
- `POST /api/chat/send/:requestId` - Send a message
- `GET /api/chat/unread-count` - Get unread count
- `GET /api/chat/summary` - Get chat summary

### Security Features

- **Authentication Required**: All chat endpoints require valid JWT token
- **Access Control**: Users can only access chats they're involved in
- **Role Verification**: Messages are tagged with sender type for proper display

## 🎨 Frontend Implementation

### Chat Component (`client/src/components/Chat.tsx`)

A reusable chat component that provides:

- **Real-time messaging** with auto-refresh every 5 seconds
- **Message threading** by diet plan request
- **Read status tracking** with visual indicators
- **Special message types** (diet plans marked with 📋 icon)
- **Responsive design** for mobile and desktop
- **Quick actions** for nutritionists (send diet plan button)

### Integration Points

#### Member Portal (`client/src/components/MemberPortal.tsx`)
- Chat button appears on **approved** diet plan requests
- Members can initiate conversations with their assigned nutritionist
- Access to full chat history and ongoing conversations

#### Nutritionist Portal (`client/src/components/NutritionistPortal.tsx`)
- Chat button appears on **approved** requests in the Diet Plan Requests tab
- Nutritionists can communicate with members and send diet plans
- Quick access to send diet plans directly through chat

## 🚀 How It Works

### 1. **Request Approval Flow**
```
Member submits request → Nutritionist approves → Chat becomes available
```

### 2. **Chat Access**
- **Members**: See "Chat with Nutritionist" button on approved requests
- **Nutritionists**: See "Chat" button on approved requests in their portal

### 3. **Message Exchange**
- Both parties can send text messages
- Nutritionists can send diet plans (marked with special icon)
- Messages are automatically marked as read when viewed
- Real-time updates every 5 seconds

### 4. **Diet Plan Delivery**
- Nutritionists can send diet plans through chat
- Diet plan messages are visually distinguished
- Members can ask questions and get clarifications
- Ongoing support throughout the nutrition journey

## 🔐 Access Control

### Member Access
- Can only chat on their own approved requests
- Cannot access other members' chats
- Messages are limited to their assigned nutritionist

### Nutritionist Access
- Can only chat on requests they're assigned to
- Cannot access chats from other nutritionists
- Can send diet plans and provide ongoing support

## 📱 User Experience Features

### Real-time Communication
- **Auto-refresh**: Messages update every 5 seconds
- **Read receipts**: Visual indicators for message status
- **Typing indicators**: Shows when messages are being sent

### Message Types
- **Text messages**: Regular chat communication
- **Diet plan messages**: Special formatting with 📋 icon
- **File attachments**: Support for document sharing (future enhancement)

### Mobile Optimization
- **Responsive design**: Works on all screen sizes
- **Touch-friendly**: Optimized for mobile devices
- **Swipe support**: Easy navigation on mobile

## 🧪 Testing the System

### Prerequisites
1. **Database setup**: Run the chat table creation SQL
2. **Backend restart**: Ensure new chat routes are loaded
3. **Approved request**: Must have an approved diet plan request

### Test Steps
1. **Login as member** → Go to Nutritionists tab → Find approved request → Click "Chat with Nutritionist"
2. **Login as nutritionist** → Go to Diet Plan Requests → Find approved request → Click "Chat"
3. **Send messages** between both users
4. **Test diet plan sending** from nutritionist side
5. **Verify real-time updates** and read status

## 🔮 Future Enhancements

### Planned Features
- **File uploads**: Support for PDF diet plans, images
- **Push notifications**: Real-time alerts for new messages
- **Message search**: Find specific conversations or content
- **Voice messages**: Audio communication option
- **Video calls**: Face-to-face consultations
- **Message reactions**: Like, heart, or react to messages

### Technical Improvements
- **WebSocket integration**: True real-time communication
- **Message encryption**: Enhanced security for sensitive health data
- **Message archiving**: Long-term storage and retrieval
- **Analytics**: Track communication patterns and engagement

## 📋 Setup Instructions

### 1. Create Chat Table
```sql
-- Run this in your database
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    diet_plan_request_id INTEGER REFERENCES diet_plan_requests(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('member', 'nutritionist')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'diet_plan', 'file')),
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_request_id ON chat_messages(diet_plan_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
```

### 2. Restart Backend
The new chat routes will be automatically loaded.

### 3. Test the System
Follow the testing steps above to verify functionality.

## 🎯 Use Cases

### Member Scenarios
- **Ask questions** about their diet plan
- **Request modifications** to meal suggestions
- **Get clarification** on nutrition advice
- **Report progress** and ask for adjustments
- **Emergency support** for dietary issues

### Nutritionist Scenarios
- **Provide ongoing support** to members
- **Send updated diet plans** through chat
- **Answer questions** about nutrition
- **Monitor progress** and provide encouragement
- **Adjust plans** based on member feedback

## 🔍 Troubleshooting

### Common Issues
1. **Chat not loading**: Check if request is approved and user has access
2. **Messages not sending**: Verify authentication token is valid
3. **Real-time not working**: Check backend is running and chat routes loaded
4. **Access denied**: Ensure user is part of the specific diet plan request

### Debug Steps
1. Check browser console for errors
2. Verify backend logs for API issues
3. Confirm database table exists
4. Test authentication and authorization

---

## 📞 Support

For technical issues or questions about the chat system, refer to the backend logs and ensure all components are properly integrated and running.
