require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Single comprehensive React course
const coursesData = [
  {
    title: "React Mastery",
    description: "Master React from fundamentals to advanced patterns. Learn component design, state management, hooks, and modern React best practices.",
    difficulty: "Intermediate",
    tags: ["React", "JavaScript", "Web Development", "Frontend"],
    lessons: [
      {
        title: "React Fundamentals and JSX",
        topic: "React Basics",
        duration: 20,
        content: [
          {
            type: "text",
            title: "Understanding React and JSX",
            content: "React is a JavaScript library for building user interfaces. JSX is a syntax extension for JavaScript that allows you to write HTML-like code within your JavaScript files. It makes React components more readable and writing templates more intuitive."
          },
          {
            type: "code",
            title: "Basic JSX Example",
            codeLanguage: "jsx",
            content: "// Basic React component with JSX\nfunction Welcome() {\n  const name = 'React Developer';\n  return (\n    <div className=\"welcome-container\">\n      <h1>Hello, {name}!</h1>\n      <p>Welcome to React development</p>\n    </div>\n  );\n}\n\n// Using JSX expressions\nfunction MathExample() {\n  const a = 10;\n  const b = 20;\n  return (\n    <div>\n      <p>The sum is: {a + b}</p>\n      <p>Is a less than b? {a < b ? 'Yes' : 'No'}</p>\n    </div>\n  );\n}"
          },
          {
            type: "text",
            title: "JSX Rules and Syntax",
            content: "When working with JSX, remember these key rules:\n1. Always return a single root element\n2. Close all tags (including self-closing tags)\n3. Use camelCase for attribute names (className instead of class)\n4. Curly braces {} for JavaScript expressions\n5. Style attributes take objects instead of strings"
          }
        ]
      },
      {
        title: "Components and Props",
        topic: "React Components",
        duration: 25,
        content: [
          {
            type: "text",
            title: "Understanding Components",
            content: "Components are the building blocks of React applications. They are reusable pieces of UI that can accept inputs (called props) and return React elements that describe what should appear on the screen."
          },
          {
            type: "code",
            title: "Component Types",
            codeLanguage: "jsx",
            content: "// Functional Component\nfunction UserCard({ name, role, avatar }) {\n  return (\n    <div className=\"user-card\">\n      <img src={avatar} alt={name} />\n      <h2>{name}</h2>\n      <p>{role}</p>\n    </div>\n  );\n}\n\n// Using the component\nfunction App() {\n  return (\n    <div>\n      <UserCard\n        name=\"John Doe\"\n        role=\"Developer\"\n        avatar=\"/path/to/avatar.jpg\"\n      />\n      <UserCard\n        name=\"Jane Smith\"\n        role=\"Designer\"\n        avatar=\"/path/to/avatar2.jpg\"\n      />\n    </div>\n  );\n}"
          },
          {
            type: "text",
            title: "Props Best Practices",
            content: "When working with props:\n1. Treat them as read-only\n2. Use prop-types or TypeScript for type checking\n3. Provide default values when needed\n4. Use object destructuring for cleaner code\n5. Keep components focused and single-purpose"
          }
        ]
      },
      {
        title: "State and Hooks",
        topic: "React State Management",
        duration: 30,
        content: [
          {
            type: "text",
            title: "Understanding State and Hooks",
            content: "State is data that can change over time in response to user actions or other events. Hooks are functions that allow you to use state and other React features in functional components. The most commonly used hooks are useState and useEffect."
          },
          {
            type: "code",
            title: "useState Hook",
            codeLanguage: "jsx",
            content: "import React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  const [isActive, setIsActive] = useState(false);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button\n        onClick={() => {\n          setCount(count + 1);\n          setIsActive(true);\n        }}\n      >\n        Increment\n      </button>\n      {isActive && <p>Counter is active!</p>}\n    </div>\n  );\n}"
          },
          {
            type: "code",
            title: "useEffect Hook",
            codeLanguage: "jsx",
            content: "import React, { useState, useEffect } from 'react';\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    async function fetchUser() {\n      try {\n        const response = await fetch(`/api/users/${userId}`);\n        const data = await response.json();\n        setUser(data);\n      } catch (error) {\n        console.error('Error fetching user:', error);\n      } finally {\n        setLoading(false);\n      }\n    }\n\n    fetchUser();\n  }, [userId]); // Only re-run if userId changes\n\n  if (loading) return <div>Loading...</div>;\n  if (!user) return <div>User not found</div>;\n\n  return (\n    <div>\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n    </div>\n  );\n}"
          }
        ]
      },
      {
        title: "Forms and User Input",
        topic: "React Forms",
        duration: 40,
        content: [
          {
            type: "text",
            title: "Handling Forms in React",
            content: "React forms differ from traditional HTML forms because form data is typically handled by React components rather than the DOM. This approach, known as 'controlled components', gives you more control over form validation, submission, and data transformation."
          },
          {
            type: "code",
            title: "Controlled Form Components",
            codeLanguage: "jsx",
            content: "import React, { useState } from 'react';\n\nfunction SignupForm() {\n  const [formData, setFormData] = useState({\n    username: '',\n    email: '',\n    password: ''\n  });\n  const [errors, setErrors] = useState({});\n\n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value\n    }));\n  };\n\n  const validateForm = () => {\n    const newErrors = {};\n    if (!formData.username) {\n      newErrors.username = 'Username is required';\n    }\n    if (!formData.email.includes('@')) {\n      newErrors.email = 'Valid email is required';\n    }\n    if (formData.password.length < 6) {\n      newErrors.password = 'Password must be at least 6 characters';\n    }\n    return newErrors;\n  };\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    const newErrors = validateForm();\n    if (Object.keys(newErrors).length === 0) {\n      // Submit form data\n      console.log('Form submitted:', formData);\n    } else {\n      setErrors(newErrors);\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <div>\n        <input\n          type=\"text\"\n          name=\"username\"\n          value={formData.username}\n          onChange={handleChange}\n          placeholder=\"Username\"\n        />\n        {errors.username && (\n          <span className=\"error\">{errors.username}</span>\n        )}\n      </div>\n\n      <div>\n        <input\n          type=\"email\"\n          name=\"email\"\n          value={formData.email}\n          onChange={handleChange}\n          placeholder=\"Email\"\n        />\n        {errors.email && (\n          <span className=\"error\">{errors.email}</span>\n        )}\n      </div>\n\n      <div>\n        <input\n          type=\"password\"\n          name=\"password\"\n          value={formData.password}\n          onChange={handleChange}\n          placeholder=\"Password\"\n        />\n        {errors.password && (\n          <span className=\"error\">{errors.password}</span>\n        )}\n      </div>\n\n      <button type=\"submit\">Sign Up</button>\n    </form>\n  );\n}"
          }
        ]
      },
      {
        title: "Performance Optimization",
        topic: "React Advanced",
        duration: 50,
        content: [
          {
            type: "text",
            title: "React Performance Optimization Techniques",
            content: "Optimizing React applications involves several key techniques: memoization with useMemo and useCallback, preventing unnecessary re-renders with React.memo, code splitting with lazy loading, and proper key usage in lists."
          },
          {
            type: "code",
            title: "Optimization Examples",
            codeLanguage: "jsx",
            content: "import React, { useState, useMemo, useCallback } from 'react';\n\n// Expensive computation example with useMemo\nfunction ProductList({ products, category }) {\n  const filteredProducts = useMemo(() => {\n    console.log('Filtering products...'); // Expensive operation\n    return products.filter(product => \n      product.category === category\n    );\n  }, [products, category]); // Only re-compute if these dependencies change\n\n  return (\n    <ul>\n      {filteredProducts.map(product => (\n        <li key={product.id}>{product.name}</li>\n      ))}\n    </ul>\n  );\n}\n\n// Callback memoization with useCallback\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n\n  const handleAddTodo = useCallback((text) => {\n    setTodos(prev => [...prev, { id: Date.now(), text }]);\n  }, []); // Empty deps array since we don't use any external values\n\n  return (\n    <div>\n      <AddTodoForm onAdd={handleAddTodo} />\n      {todos.map(todo => (\n        <TodoItem key={todo.id} todo={todo} />\n      ))}\n    </div>\n  );\n}\n\n// Preventing re-renders with React.memo\nconst TodoItem = React.memo(function TodoItem({ todo }) {\n  console.log('TodoItem render');\n  return <li>{todo.text}</li>;\n});"
          },
          {
            type: "text",
            title: "When to Optimize",
            content: "Remember that premature optimization is the root of all evil. Only optimize when:\n1. You have a measurable performance problem\n2. You've identified the bottleneck through profiling\n3. The optimization doesn't significantly complicate your code\n4. The performance gain is worth the added complexity"
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          question: "What is JSX in React?",
          options: [
            "A JavaScript XML syntax extension for writing React components",
            "A new programming language",
            "A database query language",
            "A styling framework"
          ],
          correctAnswer: 0
        },
        {
          question: "Which hook is used for side effects in React?",
          options: [
            "useState",
            "useEffect",
            "useContext",
            "useReducer"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the correct way to update state in React?",
          options: [
            "Directly modify the state object",
            "Use setState or state updater function",
            "Modify the DOM directly",
            "Use global variables"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a controlled component in React?",
          options: [
            "A component that controls other components",
            "A form element whose value is controlled by React state",
            "A component without state",
            "A component that can't be modified"
          ],
          correctAnswer: 1
        },
        {
          question: "Which method is used to prevent unnecessary re-renders in functional components?",
          options: [
            "useEffect",
            "React.memo",
            "useState",
            "useContext"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of the 'key' prop in React lists?",
          options: [
            "To style list items",
            "To help React identify which items have changed, been added, or removed",
            "To make the list sortable",
            "To add click handlers"
          ],
          correctAnswer: 1
        },
        {
          question: "When does useEffect run?",
          options: [
            "Only on component mount",
            "After every render by default, or when dependencies change",
            "Only when state changes",
            "Only when props change"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of useMemo?",
          options: [
            "To create memos",
            "To memoize expensive computations",
            "To handle side effects",
            "To manage state"
          ],
          correctAnswer: 1
        },
        {
          question: "How do you pass data from a parent to a child component?",
          options: [
            "Using global variables",
            "Using props",
            "Using state",
            "Using context"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the virtual DOM in React?",
          options: [
            "A direct copy of the browser's DOM",
            "A lightweight copy of the DOM for performance optimization",
            "A new web standard",
            "A database for React"
          ],
          correctAnswer: 1
        }
      ],
      xpReward: 200
    }
  },
  {
    title: "Node.js & Express Backend Development",
    description: "Master backend development with Node.js and Express. Learn RESTful APIs, databases, authentication, and deployment best practices.",
    difficulty: "Intermediate",
    tags: ["Node.js", "Express", "Backend", "Web Development", "JavaScript"],
    lessons: [
      {
        title: "Node.js Fundamentals",
        topic: "Node.js Basics",
        duration: 25,
        content: [
          {
            type: "text",
            title: "Understanding Node.js",
            content: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine that allows you to run JavaScript on the server side. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications."
          },
          {
            type: "code",
            title: "Basic Node.js Server",
            codeLanguage: "javascript",
            content: "const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  // Set response headers\n  res.setHeader('Content-Type', 'application/json');\n\n  // Basic routing\n  if (req.url === '/') {\n    res.end(JSON.stringify({ message: 'Welcome to our API!' }));\n  } else if (req.url === '/users') {\n    res.end(JSON.stringify({ users: ['John', 'Jane', 'Bob'] }));\n  } else {\n    res.statusCode = 404;\n    res.end(JSON.stringify({ error: 'Not Found' }));\n  }\n});\n\nconst PORT = process.env.PORT || 3000;\nserver.listen(PORT, () => {\n  console.log(`Server running at http://localhost:${PORT}`);\n});"
          },
          {
            type: "text",
            title: "Node.js Core Concepts",
            content: "Key concepts in Node.js include:\n1. Event Loop - Handles asynchronous operations\n2. Modules - Code organization through require/export\n3. npm (Node Package Manager) - Managing dependencies\n4. Asynchronous Programming - Callbacks, Promises, async/await\n5. Buffers and Streams - Handling binary data and large files"
          }
        ]
      },
      {
        title: "Express.js Framework",
        topic: "Express.js",
        duration: 35,
        content: [
          {
            type: "text",
            title: "Introduction to Express.js",
            content: "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It facilitates the rapid development of Node based web applications through a clean, intuitive API for routing, middleware, and error handling."
          },
          {
            type: "code",
            title: "Express Application Setup",
            codeLanguage: "javascript",
            content: "const express = require('express');\nconst morgan = require('morgan');\nconst cors = require('cors');\n\nconst app = express();\n\n// Middleware\napp.use(express.json()); // Parse JSON bodies\napp.use(morgan('dev')); // Logging\napp.use(cors()); // Enable CORS\n\n// Routes\napp.get('/', (req, res) => {\n  res.json({ message: 'Welcome to our API!' });\n});\n\n// Error handling middleware\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ error: 'Something broke!' });\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n  console.log(`Server is running on port ${PORT}`);\n});"
          },
          {
            type: "text",
            title: "Express.js Best Practices",
            content: "When building Express applications, follow these best practices:\n1. Use appropriate middleware for security\n2. Implement proper error handling\n3. Structure routes and controllers logically\n4. Use environment variables for configuration\n5. Implement input validation\n6. Handle async operations properly"
          }
        ]
      },
      {
        title: "RESTful API Design",
        topic: "API Development",
        duration: 35,
        content: [
          {
            type: "text",
            title: "REST Architecture",
            content: "REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP requests to perform CRUD operations (Create, Read, Update, Delete) on resources. Each resource is identified by a unique URL, and operations are performed using standard HTTP methods."
          },
          {
            type: "code",
            title: "RESTful Routes Example",
            codeLanguage: "javascript",
            content: "const express = require('express');\nconst router = express.Router();\n\n// Get all users\nrouter.get('/users', async (req, res) => {\n  try {\n    const users = await User.find();\n    res.json(users);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n\n// Get single user\nrouter.get('/users/:id', async (req, res) => {\n  try {\n    const user = await User.findById(req.params.id);\n    if (!user) return res.status(404).json({ error: 'User not found' });\n    res.json(user);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n\n// Create user\nrouter.post('/users', async (req, res) => {\n  try {\n    const user = new User(req.body);\n    await user.save();\n    res.status(201).json(user);\n  } catch (error) {\n    res.status(400).json({ error: error.message });\n  }\n});\n\n// Update user\nrouter.put('/users/:id', async (req, res) => {\n  try {\n    const user = await User.findByIdAndUpdate(\n      req.params.id,\n      req.body,\n      { new: true, runValidators: true }\n    );\n    if (!user) return res.status(404).json({ error: 'User not found' });\n    res.json(user);\n  } catch (error) {\n    res.status(400).json({ error: error.message });\n  }\n});\n\n// Delete user\nrouter.delete('/users/:id', async (req, res) => {\n  try {\n    const user = await User.findByIdAndDelete(req.params.id);\n    if (!user) return res.status(404).json({ error: 'User not found' });\n    res.json({ message: 'User deleted successfully' });\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});"
          }
        ]
      },
      {
        title: "Database Integration with MongoDB",
        topic: "Database",
        duration: 20,
        content: [
          {
            type: "text",
            title: "MongoDB and Mongoose",
            content: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js that provides a straight-forward, schema-based solution to model your application data."
          },
          {
            type: "code",
            title: "Mongoose Models and CRUD",
            codeLanguage: "javascript",
            content: "const mongoose = require('mongoose');\n\n// Define Schema\nconst userSchema = new mongoose.Schema({\n  username: {\n    type: String,\n    required: true,\n    unique: true,\n    trim: true\n  },\n  email: {\n    type: String,\n    required: true,\n    unique: true,\n    lowercase: true\n  },\n  password: {\n    type: String,\n    required: true,\n    minlength: 6\n  },\n  role: {\n    type: String,\n    enum: ['user', 'admin'],\n    default: 'user'\n  },\n  createdAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Add methods\nuserSchema.methods.toJSON = function() {\n  const user = this.toObject();\n  delete user.password;\n  return user;\n};\n\n// Static method\nuserSchema.statics.findByCredentials = async function(email, password) {\n  const user = await this.findOne({ email });\n  if (!user) throw new Error('Invalid login credentials');\n  \n  const isMatch = await bcrypt.compare(password, user.password);\n  if (!isMatch) throw new Error('Invalid login credentials');\n  \n  return user;\n};\n\nconst User = mongoose.model('User', userSchema);\n\nmodule.exports = User;"
          }
        ]
      },
      {
        title: "Authentication and Security",
        topic: "Security",
        duration: 35,
        content: [
          {
            type: "text",
            title: "JWT Authentication",
            content: "JSON Web Tokens (JWT) provide a way to securely transmit information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs are commonly used for authentication and information exchange in web applications."
          },
          {
            type: "code",
            title: "JWT Implementation",
            codeLanguage: "javascript",
            content: "const jwt = require('jsonwebtoken');\nconst bcrypt = require('bcryptjs');\n\n// Authentication middleware\nconst auth = async (req, res, next) => {\n  try {\n    const token = req.header('Authorization').replace('Bearer ', '');\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });\n    \n    if (!user) throw new Error();\n    \n    req.token = token;\n    req.user = user;\n    next();\n  } catch (error) {\n    res.status(401).json({ error: 'Please authenticate' });\n  }\n};\n\n// Login route\nrouter.post('/login', async (req, res) => {\n  try {\n    const { email, password } = req.body;\n    const user = await User.findByCredentials(email, password);\n    const token = jwt.sign(\n      { id: user._id.toString() },\n      process.env.JWT_SECRET,\n      { expiresIn: '24h' }\n    );\n    \n    user.tokens = user.tokens.concat({ token });\n    await user.save();\n    \n    res.json({ user, token });\n  } catch (error) {\n    res.status(400).json({ error: error.message });\n  }\n});\n\n// Protected route example\nrouter.get('/profile', auth, async (req, res) => {\n  res.json(req.user);\n});"
          },
          {
            type: "text",
            title: "Security Best Practices",
            content: "When building secure Node.js applications, follow these practices:\n1. Use HTTPS\n2. Implement proper authentication and authorization\n3. Hash passwords using bcrypt\n4. Validate and sanitize user input\n5. Set secure HTTP headers\n6. Implement rate limiting\n7. Use security middleware like helmet\n8. Keep dependencies updated"
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          question: "What is Node.js?",
          options: [
            "A web browser",
            "A JavaScript runtime environment",
            "A programming language",
            "A database system"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of these is NOT a core module in Node.js?",
          options: [
            "http",
            "fs",
            "express",
            "path"
          ],
          correctAnswer: 2
        },
        {
          question: "What is middleware in Express.js?",
          options: [
            "A database",
            "Functions that have access to request and response objects",
            "A template engine",
            "A routing mechanism"
          ],
          correctAnswer: 1
        },
        {
          question: "Which HTTP method should be used to update an existing resource?",
          options: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
          ],
          correctAnswer: 2
        },
        {
          question: "What does REST stand for?",
          options: [
            "Remote Execution State Transfer",
            "Representational State Transfer",
            "Resource State Transfer",
            "Remote State Transfer"
          ],
          correctAnswer: 1
        },
        {
          question: "What is MongoDB?",
          options: [
            "A SQL database",
            "A NoSQL database",
            "A programming language",
            "A web server"
          ],
          correctAnswer: 1
        },
        {
          question: "What is JWT used for?",
          options: [
            "Database queries",
            "Authentication and secure information exchange",
            "Server-side rendering",
            "File uploads"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of these is a secure way to store passwords?",
          options: [
            "Store them as plain text",
            "Use MD5 hashing",
            "Use bcrypt hashing",
            "Base64 encode them"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the purpose of the 'cors' middleware?",
          options: [
            "To compress responses",
            "To enable Cross-Origin Resource Sharing",
            "To parse JSON bodies",
            "To handle file uploads"
          ],
          correctAnswer: 1
        },
        {
          question: "Which status code indicates a successful resource creation?",
          options: [
            "200 OK",
            "201 Created",
            "204 No Content",
            "400 Bad Request"
          ],
          correctAnswer: 1
        }
      ],
      xpReward: 200
    }
  },
  {
    title: "React Native Mobile Development",
    description: "Master mobile app development with React Native. Learn to build cross-platform mobile applications for iOS and Android using your React knowledge.",
    difficulty: "Intermediate",
    tags: ["React Native", "Mobile", "JavaScript", "Cross-Platform"],
    lessons: [
      {
        title: "Introduction to React Native",
        topic: "React Native Basics",
        duration: 30,
        content: [
          {
            type: "text",
            title: "What is React Native?",
            content: "React Native is a framework for building native mobile applications using React. It allows you to create mobile apps that can run on both iOS and Android using a single codebase. React Native translates your React components into native UI elements, providing true native performance and feel."
          },
          {
            type: "code",
            title: "Basic React Native App",
            codeLanguage: "jsx",
            content: "import React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.text}>Welcome to React Native!</Text>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n    backgroundColor: '#F5FCFF',\n  },\n  text: {\n    fontSize: 20,\n    textAlign: 'center',\n    margin: 10,\n  },\n});"
          }
        ]
      },
      {
        title: "Core Components and Styling",
        topic: "UI Components",
        duration: 35,
        content: [
          {
            type: "text",
            title: "React Native Core Components",
            content: "React Native provides a set of core components that map directly to native UI elements. These include View (container), Text (text display), Image (images), ScrollView (scrollable content), TextInput (text input), and many more. Understanding these components is crucial for building mobile interfaces."
          },
          {
            type: "code",
            title: "Core Components Example",
            codeLanguage: "jsx",
            content: "import React from 'react';\nimport { View, Text, Image, ScrollView, TextInput, StyleSheet } from 'react-native';\n\nexport default function ProfileScreen() {\n  return (\n    <ScrollView style={styles.container}>\n      <View style={styles.header}>\n        <Image\n          source={{ uri: 'https://example.com/avatar.jpg' }}\n          style={styles.avatar}\n        />\n        <Text style={styles.name}>John Doe</Text>\n      </View>\n      \n      <TextInput\n        style={styles.input}\n        placeholder=\"Enter your bio\"\n        multiline\n      />\n    </ScrollView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#fff',\n  },\n  header: {\n    alignItems: 'center',\n    padding: 20,\n  },\n  avatar: {\n    width: 100,\n    height: 100,\n    borderRadius: 50,\n  },\n  name: {\n    fontSize: 24,\n    fontWeight: 'bold',\n    marginTop: 10,\n  },\n  input: {\n    margin: 20,\n    padding: 10,\n    borderWidth: 1,\n    borderColor: '#ddd',\n    borderRadius: 5,\n  },\n});"
          }
        ]
      },
      {
        title: "Navigation and Routing",
        topic: "Navigation",
        duration: 40,
        content: [
          {
            type: "text",
            title: "React Navigation",
            content: "Navigation is a crucial aspect of mobile apps. React Navigation is the most popular navigation library for React Native. It provides various types of navigation patterns like stack navigation (pushing/popping screens), tab navigation (switching between tabs), and drawer navigation (side menu)."
          },
          {
            type: "code",
            title: "Navigation Setup",
            codeLanguage: "jsx",
            content: "import React from 'react';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createStackNavigator } from '@react-navigation/stack';\nimport { createBottomTabNavigator } from '@react-navigation/bottom-tabs';\n\nconst Stack = createStackNavigator();\nconst Tab = createBottomTabNavigator();\n\nfunction HomeScreen({ navigation }) {\n  return (\n    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>\n      <Text>Home Screen</Text>\n      <Button\n        title=\"Go to Details\"\n        onPress={() => navigation.navigate('Details')}\n      />\n    </View>\n  );\n}\n\nfunction TabNavigator() {\n  return (\n    <Tab.Navigator>\n      <Tab.Screen name=\"Home\" component={HomeScreen} />\n      <Tab.Screen name=\"Profile\" component={ProfileScreen} />\n    </Tab.Navigator>\n  );\n}\n\nexport default function App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator>\n        <Stack.Screen name=\"Main\" component={TabNavigator} />\n        <Stack.Screen name=\"Details\" component={DetailsScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}"
          }
        ]
      },
      {
        title: "Working with Device Features",
        topic: "Native Features",
        duration: 45,
        content: [
          {
            type: "text",
            title: "Accessing Native Features",
            content: "React Native provides APIs to access device features like camera, location, storage, and sensors. Additionally, there's a rich ecosystem of third-party packages that provide access to various native functionalities. Understanding how to work with these features is essential for creating full-featured mobile apps."
          },
          {
            type: "code",
            title: "Device Features Example",
            codeLanguage: "jsx",
            content: "import React, { useState, useEffect } from 'react';\nimport { View, Text, Button, Image } from 'react-native';\nimport * as ImagePicker from 'expo-image-picker';\nimport * as Location from 'expo-location';\n\nexport default function DeviceFeaturesScreen() {\n  const [image, setImage] = useState(null);\n  const [location, setLocation] = useState(null);\n\n  const pickImage = async () => {\n    const result = await ImagePicker.launchImageLibraryAsync({\n      mediaTypes: ImagePicker.MediaTypeOptions.Images,\n      allowsEditing: true,\n      aspect: [4, 3],\n      quality: 1,\n    });\n\n    if (!result.canceled) {\n      setImage(result.assets[0].uri);\n    }\n  };\n\n  const getLocation = async () => {\n    let { status } = await Location.requestForegroundPermissionsAsync();\n    if (status !== 'granted') {\n      alert('Permission denied');\n      return;\n    }\n\n    let location = await Location.getCurrentPositionAsync({});\n    setLocation(location.coords);\n  };\n\n  return (\n    <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>\n      <Button title=\"Pick an image\" onPress={pickImage} />\n      {image && (\n        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />\n      )}\n      \n      <Button title=\"Get Location\" onPress={getLocation} />\n      {location && (\n        <Text>\n          Lat: {location.latitude}, Lon: {location.longitude}\n        </Text>\n      )}\n    </View>\n  );\n}"
          }
        ]
      },
      {
        title: "App Performance and Optimization",
        topic: "Performance",
        duration: 35,
        content: [
          {
            type: "text",
            title: "Optimizing React Native Apps",
            content: "Performance is crucial for mobile apps. Learn techniques for optimizing React Native apps including proper list rendering, image optimization, reducing unnecessary re-renders, and handling memory leaks. Understanding these concepts helps create smooth, responsive apps."
          },
          {
            type: "code",
            title: "Performance Optimization Examples",
            codeLanguage: "jsx",
            content: "import React, { memo, useCallback } from 'react';\nimport { FlatList, View, Text, Image } from 'react-native';\n\n// Optimized list item component\nconst ListItem = memo(({ item }) => (\n  <View style={styles.item}>\n    <Image\n      source={{ uri: item.image }}\n      style={styles.image}\n      // Optimize image loading\n      resizeMode=\"cover\"\n      fadeDuration={0}\n    />\n    <Text>{item.title}</Text>\n  </View>\n));\n\nexport default function OptimizedList({ data }) {\n  // Memoize item renderer\n  const renderItem = useCallback(({ item }) => (\n    <ListItem item={item} />\n  ), []);\n\n  // Memoize key extractor\n  const keyExtractor = useCallback((item) => \n    item.id.toString(), []);\n\n  return (\n    <FlatList\n      data={data}\n      renderItem={renderItem}\n      keyExtractor={keyExtractor}\n      // Performance props\n      removeClippedSubviews={true}\n      maxToRenderPerBatch={10}\n      updateCellsBatchingPeriod={50}\n      windowSize={5}\n      // Optimize memory usage\n      initialNumToRender={10}\n    />\n  );\n}"
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          question: "What is React Native?",
          options: [
            "A web framework",
            "A cross-platform mobile development framework",
            "A database system",
            "A design tool"
          ],
          correctAnswer: 1
        },
        {
          question: "Which component is equivalent to a <div> in React Native?",
          options: [
            "Container",
            "View",
            "Div",
            "Box"
          ],
          correctAnswer: 1
        },
        {
          question: "How is styling done in React Native?",
          options: [
            "Using CSS files",
            "Using StyleSheet.create() and inline styles",
            "Using HTML style attributes",
            "Using SCSS"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of the NavigationContainer in React Navigation?",
          options: [
            "To style the navigation",
            "To manage the navigation state and link it to the app environment",
            "To create navigation buttons",
            "To handle back navigation"
          ],
          correctAnswer: 1
        },
        {
          question: "Which component should be used for scrollable content?",
          options: [
            "View",
            "ScrollView or FlatList",
            "Container",
            "Scroll"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the difference between ScrollView and FlatList?",
          options: [
            "There is no difference",
            "ScrollView renders all items at once, FlatList renders items lazily",
            "FlatList is for horizontal scrolling only",
            "ScrollView is faster"
          ],
          correctAnswer: 1
        },
        {
          question: "How do you handle platform-specific code in React Native?",
          options: [
            "It's not possible",
            "Using Platform.select() or platform-specific file extensions",
            "Using if statements",
            "Using CSS media queries"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of the expo-image-picker library?",
          options: [
            "To edit images",
            "To access the device's image library and camera",
            "To upload images",
            "To display images"
          ],
          correctAnswer: 1
        },
        {
          question: "How do you optimize large lists in React Native?",
          options: [
            "By loading all items at once",
            "Using FlatList with proper configuration and item memoization",
            "Using ScrollView",
            "Lists don't need optimization"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the recommended way to handle navigation in React Native?",
          options: [
            "Using HTML links",
            "Using React Navigation",
            "Using window.location",
            "Using React Router"
          ],
          correctAnswer: 1
        }
      ],
      xpReward: 200
    }
  },
  {
    title: "Database Fundamentals",
    description: "Master database concepts, SQL, and database design. Learn how to create, manage, and optimize databases for modern applications.",
    difficulty: "Beginner",
    tags: ["Database", "SQL", "Backend", "Data"],
    lessons: [
      {
        title: "Introduction to Databases",
        topic: "Database Basics",
        duration: 30,
        content: [
          {
            type: "text",
            title: "What is a Database?",
            content: "A database is an organized collection of structured information stored electronically. Databases are designed to manage large collections of data efficiently, providing mechanisms for storing, retrieving, updating, and deleting data. Modern applications rely heavily on databases to store and manage their data effectively."
          },
          {
            type: "text",
            title: "Types of Databases",
            content: "There are several types of databases:\n1. Relational Databases (SQL): MySQL, PostgreSQL, Oracle\n2. NoSQL Databases: MongoDB, Cassandra, Redis\n3. Graph Databases: Neo4j\n4. Time Series Databases: InfluxDB\n\nEach type is optimized for specific use cases and data models."
          }
        ]
      },
      {
        title: "SQL Fundamentals",
        topic: "SQL",
        duration: 45,
        content: [
          {
            type: "text",
            title: "Introduction to SQL",
            content: "SQL (Structured Query Language) is the standard language for managing and manipulating relational databases. It allows you to create, read, update, and delete data in a structured way."
          },
          {
            type: "code",
            title: "Basic SQL Queries",
            codeLanguage: "sql",
            content: "-- Select all columns from a table\nSELECT * FROM users;\n\n-- Select specific columns\nSELECT first_name, last_name, email FROM users;\n\n-- Filter results with WHERE clause\nSELECT * FROM users\nWHERE age >= 18;\n\n-- Sort results\nSELECT * FROM users\nORDER BY last_name ASC;\n\n-- Limit results\nSELECT * FROM products\nLIMIT 10;"
          },
          {
            type: "code",
            title: "Joins and Relationships",
            codeLanguage: "sql",
            content: "-- Inner Join\nSELECT orders.id, users.email, orders.total\nFROM orders\nINNER JOIN users ON orders.user_id = users.id;\n\n-- Left Join\nSELECT users.email, orders.id\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;\n\n-- Multiple Joins\nSELECT orders.id, users.email, products.name\nFROM orders\nJOIN users ON orders.user_id = users.id\nJOIN order_items ON orders.id = order_items.order_id\nJOIN products ON order_items.product_id = products.id;"
          }
        ]
      },
      {
        title: "Database Design",
        topic: "Design",
        duration: 40,
        content: [
          {
            type: "text",
            title: "Database Design Principles",
            content: "Good database design is crucial for application performance and maintainability. Key principles include:\n1. Normalization - Organizing data to reduce redundancy\n2. Relationships - Defining how tables connect\n3. Primary and Foreign Keys - Ensuring data integrity\n4. Indexing - Optimizing query performance"
          },
          {
            type: "code",
            title: "Creating Tables and Relationships",
            codeLanguage: "sql",
            content: "-- Create users table\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  password_hash VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Create orders table with foreign key\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id),\n  total DECIMAL(10,2) NOT NULL,\n  status VARCHAR(50) DEFAULT 'pending',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Create index for frequent queries\nCREATE INDEX idx_orders_user_id ON orders(user_id);"
          }
        ]
      },
      {
        title: "Database Optimization",
        topic: "Performance",
        duration: 35,
        content: [
          {
            type: "text",
            title: "Query Optimization",
            content: "Optimizing database performance involves several strategies:\n1. Proper indexing\n2. Query optimization\n3. Database normalization\n4. Caching strategies\n5. Regular maintenance"
          },
          {
            type: "code",
            title: "Optimization Examples",
            codeLanguage: "sql",
            content: "-- Using EXPLAIN to analyze query performance\nEXPLAIN ANALYZE\nSELECT * FROM orders\nWHERE user_id = 123;\n\n-- Creating composite index\nCREATE INDEX idx_orders_user_status \nON orders(user_id, status);\n\n-- Optimizing JOIN queries\nSELECT u.email, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.email\nHAVING COUNT(o.id) > 5;"
          }
        ]
      },
      {
        title: "Data Security and Backup",
        topic: "Security",
        duration: 35,
        content: [
          {
            type: "text",
            title: "Database Security",
            content: "Protecting your database is crucial. Key security measures include:\n1. User authentication and authorization\n2. Encryption at rest and in transit\n3. Regular backups\n4. Security auditing\n5. Input validation to prevent SQL injection"
          },
          {
            type: "code",
            title: "Security Implementation",
            codeLanguage: "sql",
            content: "-- Create user with limited privileges\nCREATE USER 'app_user'@'localhost' \nIDENTIFIED BY 'secure_password';\n\n-- Grant specific permissions\nGRANT SELECT, INSERT, UPDATE \nON myapp.* \nTO 'app_user'@'localhost';\n\n-- Create backup\nBACKUP DATABASE myapp\nTO DISK = 'backup_location'\nWITH COMPRESSION, ENCRYPTION;"
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          question: "What is a primary key in a database?",
          options: [
            "A key used to unlock the database",
            "A unique identifier for each record in a table",
            "The first column in a table",
            "A backup key"
          ],
          correctAnswer: 1
        },
        {
          question: "Which SQL command is used to retrieve data from a database?",
          options: [
            "GET",
            "SELECT",
            "FETCH",
            "RETRIEVE"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a foreign key?",
          options: [
            "A key from another country",
            "A field that links to a primary key in another table",
            "A backup key",
            "An encrypted key"
          ],
          correctAnswer: 1
        },
        {
          question: "What is database normalization?",
          options: [
            "Converting database to normal time zone",
            "Process of organizing data to reduce redundancy",
            "Making all data uppercase",
            "Backing up the database"
          ],
          correctAnswer: 1
        },
        {
          question: "Which type of JOIN returns all records from the left table?",
          options: [
            "RIGHT JOIN",
            "LEFT JOIN",
            "INNER JOIN",
            "FULL JOIN"
          ],
          correctAnswer: 1
        },
        {
          question: "What is an index in a database?",
          options: [
            "A table of contents",
            "A data structure that improves the speed of data retrieval",
            "The first row of data",
            "A primary key"
          ],
          correctAnswer: 1
        },
        {
          question: "What is SQL injection?",
          options: [
            "A way to insert data into a table",
            "A type of security vulnerability where malicious SQL code is inserted",
            "A database backup method",
            "A type of JOIN"
          ],
          correctAnswer: 1
        },
        {
          question: "Which command is used to modify existing records in a table?",
          options: [
            "MODIFY",
            "UPDATE",
            "CHANGE",
            "ALTER"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of the GROUP BY clause?",
          options: [
            "To sort records",
            "To group rows that have the same values in specified columns",
            "To join tables",
            "To filter records"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a transaction in a database?",
          options: [
            "A financial operation",
            "A unit of work that is performed as a whole",
            "A table join",
            "A type of key"
          ],
          correctAnswer: 1
        }
      ],
      xpReward: 200
    }
  }
];

async function createCourseWithLessons(courseData) {
  // Create a copy of courseData and extract lessons and quiz
  const courseFields = { ...courseData };
  const lessonTemplates = courseFields.lessons || [];
  const quizTemplate = courseFields.quiz;
  delete courseFields.lessons;
  delete courseFields.quiz;

  // Create the course without lessons first
  const course = new Course(courseFields);
  await course.save();

  // Create lessons and store their IDs
  if (lessonTemplates && lessonTemplates.length > 0) {
    for (const lessonTemplate of lessonTemplates) {
      const lesson = new Lesson({
        ...lessonTemplate,
        courseId: course._id
      });
      await lesson.save();
      course.lessons.push(lesson._id);
    }
  }

  // Create quiz if provided
  if (quizTemplate) {
    const quiz = new Quiz({
      ...quizTemplate,
      courseId: course._id
    });
    await quiz.save();
  }

  // Save the course again with lesson references
  await course.save();
  console.log(`Created course: ${course.title} with ${course.lessons.length} lessons and quiz`);
  return course;
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codementor');
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Promise.all([
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({})
    ]);
    console.log('Cleared existing courses, lessons, and quizzes');
    
    // Create the React course
    for (const courseData of coursesData) {
      await createCourseWithLessons(courseData);
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Call the seed function
seedDatabase();