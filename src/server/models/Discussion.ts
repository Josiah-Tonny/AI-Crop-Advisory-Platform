import mongoose from 'mongoose';
import { User } from './User';

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    minlength: [2, 'Reply must be at least 2 characters long'],
    maxlength: [2000, 'Reply cannot be longer than 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isLiked
replySchema.virtual('isLiked').get(function() {
  return false; // This will be populated by the API
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot be longer than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters long'],
    maxlength: [5000, 'Content cannot be longer than 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'general',
      'crop-management',
      'pest-control',
      'soil-health',
      'irrigation',
      'weather',
      'market-prices',
      'success-stories',
      'equipment'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  replies: [replySchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isLiked
discussionSchema.virtual('isLiked').get(function() {
  return false; // This will be populated by the API
});

// Add text index for search
discussionSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;