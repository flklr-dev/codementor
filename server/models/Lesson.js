const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // minutes
    required: true
  },
  content: [{
    type: {
      type: String,
      enum: ['text', 'code', 'image'],
      required: true
    },
    title: String,
    content: String,
    codeLanguage: String
  }],
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson; 