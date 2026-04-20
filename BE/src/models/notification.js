// models/notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['mail', 'package', 'message', 'arco', 'system', 'alert', 'request'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}) {
  try {
    const notification = new this({
      userId,
      type,
      title,
      message,
      data,
      createdAt: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;