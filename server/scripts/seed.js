require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// Sample course data
const coursesData = [
  {
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming language",
    difficulty: "Beginner",
    tags: ["JavaScript", "Web Development", "Programming"]
  },
  {
    title: "React Essentials",
    description: "Master React basics and build modern user interfaces",
    difficulty: "Intermediate",
    tags: ["React", "JavaScript", "Frontend"]
  },
  {
    title: "Node.js Backend Development",
    description: "Learn server-side JavaScript with Node.js and Express",
    difficulty: "Intermediate",
    tags: ["Node.js", "Express", "Backend"]
  },
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python - perfect for beginners",
    difficulty: "Beginner",
    tags: ["Python", "Programming", "Data Science"]
  },
  {
    title: "Advanced TypeScript",
    description: "Master TypeScript's type system and advanced features",
    difficulty: "Advanced",
    tags: ["TypeScript", "JavaScript", "Web Development"]
  },
  {
    title: "Mobile Development with React Native",
    description: "Build cross-platform mobile apps with React Native",
    difficulty: "Intermediate",
    tags: ["React Native", "Mobile", "JavaScript"]
  },
  {
    title: "GraphQL API Development",
    description: "Learn to build efficient APIs with GraphQL",
    difficulty: "Intermediate",
    tags: ["GraphQL", "API", "Backend"]
  },
  {
    title: "DevOps Fundamentals",
    description: "Learn CI/CD, containerization, and cloud deployment",
    difficulty: "Intermediate",
    tags: ["DevOps", "Docker", "Cloud"]
  },
  {
    title: "CSS Mastery: Modern Styling Techniques",
    description: "Learn modern CSS techniques to create beautiful, responsive websites",
    difficulty: "Beginner",
    tags: ["CSS", "Frontend", "Web Development"]
  }
];

// Define additionalCoursesData that was missing
const additionalCoursesData = [
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python - perfect for beginners",
    difficulty: "Beginner",
    tags: ["Python", "Programming", "Data Science"]
  },
  {
    title: "Advanced TypeScript",
    description: "Master TypeScript's type system and advanced features",
    difficulty: "Advanced",
    tags: ["TypeScript", "JavaScript", "Web Development"]
  },
  {
    title: "Mobile Development with React Native",
    description: "Build cross-platform mobile apps with React Native",
    difficulty: "Intermediate",
    tags: ["React Native", "Mobile", "JavaScript"]
  },
  {
    title: "GraphQL API Development",
    description: "Learn to build efficient APIs with GraphQL",
    difficulty: "Intermediate",
    tags: ["GraphQL", "API", "Backend"]
  },
  {
    title: "DevOps Fundamentals",
    description: "Learn CI/CD, containerization, and cloud deployment",
    difficulty: "Intermediate",
    tags: ["DevOps", "Docker", "Cloud"]
  }
];

// Sample lesson data - we'll link these to courses after creating them
const lessonsTemplate = [
  // JavaScript Fundamentals lessons
  [
    {
      title: "Variables and Data Types",
      topic: "JavaScript Basics",
      duration: 20,
      content: [
        {
          type: "text",
          title: "Introduction to Variables",
          content: "Variables are containers for storing data values in JavaScript..."
        },
        {
          type: "code",
          title: "Declaring Variables",
          codeLanguage: "javascript",
          content: "// Using let (recommended)\nlet name = 'John';\n\n// Using const for values that won't change\nconst age = 30;\n\n// Using var (older way)\nvar isStudent = true;"
        },
        {
          type: "text",
          title: "Data Types",
          content: "JavaScript has several data types including strings, numbers, booleans, objects, and more."
        }
      ]
    },
    {
      title: "Functions and Scope",
      topic: "JavaScript Basics",
      duration: 25,
      content: [
        {
          type: "text",
          title: "Understanding Functions",
          content: "Functions are blocks of reusable code that perform specific tasks..."
        },
        {
          type: "code",
          title: "Declaring Functions",
          codeLanguage: "javascript",
          content: "// Function declaration\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Function expression\nconst sayGoodbye = function(name) {\n  return `Goodbye, ${name}!`;\n};\n\n// Arrow function\nconst multiply = (a, b) => a * b;"
        }
      ]
    }
  ],
  
  // React Essentials lessons - Expanded with 5 detailed lessons
  [
    {
      title: "Getting Started with React",
      topic: "React Basics",
      duration: 30,
      content: [
        {
          type: "text",
          title: "What is React?",
          content: "React is a JavaScript library for building user interfaces. It allows developers to create large web applications that can change data without reloading the page. The main purpose of React is to be fast, scalable, and simple. It works only on the user interface in the application."
        },
        {
          type: "text",
          title: "Why Use React?",
          content: "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes. Declarative views make your code more predictable and easier to debug."
        },
        {
          type: "code",
          title: "Your First Component",
          codeLanguage: "jsx",
          content: "import React from 'react';\n\nfunction Welcome() {\n  return <h1>Hello, React!</h1>;\n}\n\nexport default Welcome;"
        },
        {
          type: "text",
          title: "Setting Up Your Environment",
          content: "To get started with React, you'll need Node.js installed on your computer. You can create a new React application using Create React App, which sets up your development environment so that you can use the latest JavaScript features and optimizes your app for production."
        },
        {
          type: "code",
          title: "Creating a New React App",
          codeLanguage: "bash",
          content: "# Using npx (recommended)\nnpx create-react-app my-app\n\n# Navigate to your new app\ncd my-app\n\n# Start the development server\nnpm start"
        }
      ]
    },
    {
      title: "React Components and Props",
      topic: "React Basics",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Understanding Components",
          content: "Components are the building blocks of any React application. A component is a JavaScript function or class that optionally accepts inputs (called 'props') and returns a React element that describes how a section of the UI should appear."
        },
        {
          type: "code",
          title: "Functional Components",
          codeLanguage: "jsx",
          content: "// A simple functional component\nfunction Greeting(props) {\n  return <h1>Hello, {props.name}!</h1>;\n}\n\n// Using the component\n<Greeting name=\"Alice\" />"
        },
        {
          type: "code",
          title: "Class Components",
          codeLanguage: "jsx",
          content: "// A class component\nclass Greeting extends React.Component {\n  render() {\n    return <h1>Hello, {this.props.name}!</h1>;\n  }\n}\n\n// Using the component\n<Greeting name=\"Bob\" />"
        },
        {
          type: "text",
          title: "Props: Passing Data",
          content: "Props (short for properties) are how you pass data from a parent component to a child component. They are read-only and help make your components reusable. Think of them as function arguments."
        },
        {
          type: "code",
          title: "Working with Props",
          codeLanguage: "jsx",
          content: "// Parent component passing props\nfunction App() {\n  return (\n    <div>\n      <UserProfile \n        name=\"Jane Doe\" \n        role=\"Developer\" \n        skills={['React', 'JavaScript', 'CSS']} \n      />\n    </div>\n  );\n}\n\n// Child component receiving props\nfunction UserProfile(props) {\n  return (\n    <div className=\"profile\">\n      <h2>{props.name}</h2>\n      <p>Role: {props.role}</p>\n      <p>Skills: {props.skills.join(', ')}</p>\n    </div>\n  );\n}"
        }
      ]
    },
    {
      title: "State and Lifecycle",
      topic: "React Core Concepts",
      duration: 40,
      content: [
        {
          type: "text",
          title: "Understanding State",
          content: "State is a JavaScript object that stores a component's dynamic data and determines the component's behavior. While props are passed down from parents and are immutable, state is managed within the component and can change over time."
        },
        {
          type: "code",
          title: "Using State with Hooks",
          codeLanguage: "jsx",
          content: "import React, { useState } from 'react';\n\nfunction Counter() {\n  // Declare a state variable 'count' with initial value 0\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}"
        },
        {
          type: "text",
          title: "Component Lifecycle",
          content: "Each React component goes through a lifecycle of events: mounting (being inserted into the DOM), updating (when props or state changes), and unmounting (being removed from the DOM). Understanding this lifecycle is crucial for optimizing your React applications."
        },
        {
          type: "code",
          title: "Using Lifecycle with Hooks",
          codeLanguage: "jsx",
          content: "import React, { useState, useEffect } from 'react';\n\nfunction Timer() {\n  const [seconds, setSeconds] = useState(0);\n\n  useEffect(() => {\n    // This runs after render (similar to componentDidMount and componentDidUpdate)\n    const interval = setInterval(() => {\n      setSeconds(seconds => seconds + 1);\n    }, 1000);\n    \n    // This cleanup function runs before the component unmounts (like componentWillUnmount)\n    return () => clearInterval(interval);\n  }, []); // Empty dependency array means this effect runs once on mount\n\n  return <div>Seconds: {seconds}</div>;\n}"
        },
        {
          type: "text",
          title: "Rules of Hooks",
          content: "Hooks are a new addition in React 16.8 that let you use state and other React features without writing a class. There are two important rules to follow when using Hooks: only call Hooks at the top level (not inside loops, conditions, or nested functions), and only call Hooks from React function components or custom Hooks."
        }
      ]
    },
    {
      title: "Handling Events and Forms",
      topic: "React Interactions",
      duration: 35,
      content: [
        {
          type: "text",
          title: "React Event Handling",
          content: "Handling events in React is similar to handling events in DOM, but with some syntax differences. React events are named using camelCase (e.g., onClick instead of onclick), and you pass a function as the event handler rather than a string."
        },
        {
          type: "code",
          title: "Basic Event Handling",
          codeLanguage: "jsx",
          content: "function Button() {\n  const handleClick = () => {\n    alert('Button was clicked!');\n  };\n\n  return (\n    <button onClick={handleClick}>\n      Click Me\n    </button>\n  );\n}"
        },
        {
          type: "text",
          title: "Working with Forms",
          content: "In React, form elements work a bit differently from other DOM elements because form elements naturally keep some internal state. There are two main approaches to handling forms: controlled components (where React controls the form data) and uncontrolled components (where the DOM controls the form data)."
        },
        {
          type: "code",
          title: "Controlled Form Components",
          codeLanguage: "jsx",
          content: "import React, { useState } from 'react';\n\nfunction LoginForm() {\n  const [username, setUsername] = useState('');\n  const [password, setPassword] = useState('');\n\n  const handleSubmit = (event) => {\n    event.preventDefault();\n    console.log('Login attempted with:', username, password);\n    // Here you would typically call an API to authenticate\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <div>\n        <label htmlFor=\"username\">Username:</label>\n        <input\n          type=\"text\"\n          id=\"username\"\n          value={username}\n          onChange={(e) => setUsername(e.target.value)}\n        />\n      </div>\n      <div>\n        <label htmlFor=\"password\">Password:</label>\n        <input\n          type=\"password\"\n          id=\"password\"\n          value={password}\n          onChange={(e) => setPassword(e.target.value)}\n        />\n      </div>\n      <button type=\"submit\">Login</button>\n    </form>\n  );\n}"
        },
        {
          type: "text",
          title: "Form Validation",
          content: "Form validation is an important part of creating user-friendly forms. In React, you can implement validation logic in your event handlers and display error messages to guide users. This helps ensure that the data submitted is in the correct format and meets your requirements."
        }
      ]
    },
    {
      title: "Building a Simple React App",
      topic: "React Project",
      duration: 45,
      content: [
        {
          type: "text",
          title: "Project Overview",
          content: "In this lesson, we'll build a simple todo list application that demonstrates the core concepts of React. This project will incorporate components, state, props, and event handling to create a functional and interactive application."
        },
        {
          type: "code",
          title: "App Component Structure",
          codeLanguage: "jsx",
          content: "import React, { useState } from 'react';\nimport TodoForm from './TodoForm';\nimport TodoList from './TodoList';\n\nfunction TodoApp() {\n  const [todos, setTodos] = useState([]);\n\n  const addTodo = (text) => {\n    const newTodo = {\n      id: Date.now(),\n      text,\n      completed: false\n    };\n    setTodos([...todos, newTodo]);\n  };\n\n  const toggleTodo = (id) => {\n    setTodos(\n      todos.map(todo =>\n        todo.id === id ? { ...todo, completed: !todo.completed } : todo\n      )\n    );\n  };\n\n  const deleteTodo = (id) => {\n    setTodos(todos.filter(todo => todo.id !== id));\n  };\n\n  return (\n    <div className=\"todo-app\">\n      <h1>Todo List</h1>\n      <TodoForm addTodo={addTodo} />\n      <TodoList \n        todos={todos} \n        toggleTodo={toggleTodo} \n        deleteTodo={deleteTodo} \n      />\n    </div>\n  );\n}"
        },
        {
          type: "code",
          title: "Todo Form Component",
          codeLanguage: "jsx",
          content: "import React, { useState } from 'react';\n\nfunction TodoForm({ addTodo }) {\n  const [text, setText] = useState('');\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    if (!text.trim()) return;\n    addTodo(text);\n    setText('');\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        type=\"text\"\n        value={text}\n        onChange={(e) => setText(e.target.value)}\n        placeholder=\"Add a new todo\"\n      />\n      <button type=\"submit\">Add</button>\n    </form>\n  );\n}"
        },
        {
          type: "code",
          title: "Todo List Component",
          codeLanguage: "jsx",
          content: "import React from 'react';\nimport TodoItem from './TodoItem';\n\nfunction TodoList({ todos, toggleTodo, deleteTodo }) {\n  if (todos.length === 0) {\n    return <p>No todos yet! Add one above.</p>;\n  }\n\n  return (\n    <ul className=\"todo-list\">\n      {todos.map(todo => (\n        <TodoItem\n          key={todo.id}\n          todo={todo}\n          toggleTodo={toggleTodo}\n          deleteTodo={deleteTodo}\n        />\n      ))}\n    </ul>\n  );\n}"
        },
        {
          type: "code",
          title: "Todo Item Component",
          codeLanguage: "jsx",
          content: "import React from 'react';\n\nfunction TodoItem({ todo, toggleTodo, deleteTodo }) {\n  return (\n    <li className=\"todo-item\">\n      <input\n        type=\"checkbox\"\n        checked={todo.completed}\n        onChange={() => toggleTodo(todo.id)}\n      />\n      <span\n        style={{\n          textDecoration: todo.completed ? 'line-through' : 'none'\n        }}\n      >\n        {todo.text}\n      </span>\n      <button onClick={() => deleteTodo(todo.id)}>Delete</button>\n    </li>\n  );\n}"
        }
      ]
    }
  ],
  
  // Node.js Backend Development lessons
  [
    {
      title: "Introduction to Node.js",
      topic: "Node.js Basics",
      duration: 25,
      content: [
        {
          type: "text",
          title: "What is Node.js?",
          content: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine..."
        },
        {
          type: "code",
          title: "Hello World Server",
          codeLanguage: "javascript",
          content: "const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.statusCode = 200;\n  res.setHeader('Content-Type', 'text/plain');\n  res.end('Hello World');\n});\n\nserver.listen(3000, () => {\n  console.log('Server running at http://localhost:3000/');\n});"
        }
      ]
    },
    {
      title: "Express.js Framework",
      topic: "Node.js",
      duration: 40,
      content: [
        {
          type: "text",
          title: "Introduction to Express.js",
          content: "Express.js is a web application framework for Node.js. It's designed to create web applications and APIs quickly and easily."
        },
        {
          type: "code",
          title: "Setting up Express.js",
          codeLanguage: "javascript",
          content: "const express = require('express');\nconst app = express();\nconst port = 3000;\n\n// Middleware\napp.use(express.json());\n\n// Sample data - in a real app, this would be in a database\nlet books = [\n  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },\n  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },\n  { id: 3, title: '1984', author: 'George Orwell', year: 1949 }\n];\n\n// GET all books\napp.get('/api/books', (req, res) => {\n  res.json(books);\n});\n\n// GET a single book\napp.get('/api/books/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const book = books.find(b => b.id === id);\n  \n  if (!book) {\n    return res.status(404).json({ message: 'Book not found' });\n  }\n  \n  res.json(book);\n});\n\n// POST a new book\napp.post('/api/books', (req, res) => {\n  const { title, author, year } = req.body;\n  \n  if (!title || !author) {\n    return res.status(400).json({ message: 'Title and author are required' });\n  }\n  \n  const newBook = {\n    id: books.length + 1,\n    title,\n    author,\n    year: year || new Date().getFullYear()\n  };\n  \n  books.push(newBook);\n  res.status(201).json(newBook);\n});\n\n// PUT (update) a book\napp.put('/api/books/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const { title, author, year } = req.body;\n  \n  const bookIndex = books.findIndex(b => b.id === id);\n  \n  if (bookIndex === -1) {\n    return res.status(404).json({ message: 'Book not found' });\n  }\n  \n  const updatedBook = {\n    id,\n    title: title || books[bookIndex].title,\n    author: author || books[bookIndex].author,\n    year: year || books[bookIndex].year\n  };\n  \n  books[bookIndex] = updatedBook;\n  res.json(updatedBook);\n});\n\n// DELETE a book\napp.delete('/api/books/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const bookIndex = books.findIndex(b => b.id === id);\n  \n  if (bookIndex === -1) {\n    return res.status(404).json({ message: 'Book not found' });\n  }\n  \n  const deletedBook = books[bookIndex];\n  books = books.filter(b => b.id !== id);\n  \n  res.json(deletedBook);\n});\n\napp.listen(port, () => {\n  console.log(`Server running at http://localhost:${port}`);\n});"
        },
        {
          type: "text",
          title: "API Documentation",
          content: "Good documentation is essential for any API. It helps developers understand how to use your API, what endpoints are available, what parameters they accept, and what responses to expect. Tools like Swagger/OpenAPI, Postman, and API Blueprint can help you create and maintain API documentation."
        }
      ]
    },
    {
      title: "RESTful API Development",
      topic: "Node.js",
      duration: 40,
      content: [
        {
          type: "text",
          title: "RESTful API Development",
          content: "RESTful APIs are a popular way to build web APIs. They use HTTP methods to interact with resources. The main concepts are: resources, methods (GET, POST, PUT, DELETE), and status codes (200, 201, 400, 404, etc.)."
        },
        {
          type: "code",
          title: "RESTful API Example",
          codeLanguage: "javascript",
          content: "const express = require('express');\nconst app = express();\nconst port = 3000;\n\n// Middleware\napp.use(express.json());\n\n// Sample data - in a real app, this would be in a database\nlet books = [\n  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },\n  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },\n  { id: 3, title: '1984', author: 'George Orwell', year: 1949 }\n];\n\n// GET all books\napp.get('/api/books', (req, res) => {\n  res.json(books);\n});\n\n// GET a single book\napp.get('/api/books/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const book = books.find(b => b.id === id);\n  \n  if (!book) {\n    return res.status(404).json({ message: 'Book not found' });\n  }\n  \n  res.json(book);\n});\n\n// POST a new book\napp.post('/api/books', (req, res) => {\n  const { title, author, year } = req.body;\n  \n  if (!title || !author) {\n    return res.status(400).json({ message: 'Title and author are required' });\n  }\n  \n  const newBook = {\n    id: books.length + 1,\n    title,\n    author,\n    year: year || new Date().getFullYear()\n  };\n  \n  books.push(newBook);\n  res.status(201).json(newBook);\n});\n\n// PUT (update) a book\napp.put('/api/books/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const { title, author, year } = req.body;\n  \n  const bookIndex = books.findIndex(b => b.id === id);\n  \n  if (bookIndex === -1) {\n    return res.status(404).json({ message: 'Book not found' });\n  }\n  \n  const updatedBook = {\n    id,\n    title: title || books[bookIndex].title,\n    author: author || books[bookIndex].author,\n    year: year || books[bookIndex].year\n  };\n  \n  books[bookIndex] = updatedBook;\n  res.json(updatedBook);\n});\n\n// DELETE a book\napp.delete('/api/books/:id', (req, res) => {\n  const id = parseInt(req.params.id);\n  const bookIndex = books.findIndex(b => b.id === id);\n  \n  if (bookIndex === -1) {\n    return res.status(404).json({ message: 'Book not found' });\n  }\n  \n  const deletedBook = books[bookIndex];\n  books = books.filter(b => b.id !== id);\n  \n  res.json(deletedBook);\n});\n\napp.listen(port, () => {\n  console.log(`Server running at http://localhost:${port}`);\n});"
        },
        {
          type: "text",
          title: "API Documentation",
          content: "Good documentation is essential for any API. It helps developers understand how to use your API, what endpoints are available, what parameters they accept, and what responses to expect. Tools like Swagger/OpenAPI, Postman, and API Blueprint can help you create and maintain API documentation."
        }
      ]
    },
    {
      title: "MongoDB with Node.js",
      topic: "Node.js",
      duration: 40,
      content: [
        {
          type: "text",
          title: "Introduction to MongoDB",
          content: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents. It's a popular choice for Node.js applications because it works well with JavaScript and provides a flexible schema that can evolve with your application's needs. MongoDB is particularly well-suited for applications with complex, evolving data structures."
        },
        {
          type: "text",
          title: "Mongoose ODM",
          content: "Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a schema-based solution to model your application data and includes built-in type casting, validation, query building, and business logic hooks. Mongoose makes it easier to work with MongoDB by providing a structured way to define models and interact with the database."
        },
        {
          type: "code",
          title: "Setting up Mongoose",
          codeLanguage: "javascript",
          content: "const mongoose = require('mongoose');\n\n// Connect to MongoDB\nmongoose.connect('mongodb://localhost:27017/myapp', {\n  useNewUrlParser: true,\n  useUnifiedTopology: true\n})\n  .then(() => console.log('Connected to MongoDB'))\n  .catch(err => console.error('Could not connect to MongoDB', err));\n\n// Define a schema\nconst userSchema = new mongoose.Schema({\n  name: {\n    type: String,\n    required: true,\n    minlength: 3,\n    maxlength: 50\n  },\n  email: {\n    type: String,\n    required: true,\n    unique: true,\n    match: /^\\S+@\\S+\\.\\S+$/\n  },\n  password: {\n    type: String,\n    required: true,\n    minlength: 8\n  },\n  isAdmin: {\n    type: Boolean,\n    default: false\n  },\n  createdAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Create a model from the schema\nconst User = mongoose.model('User', userSchema);\n\n// Create a new user\nasync function createUser() {\n  const user = new User({\n    name: 'John Doe',\n    email: 'john@example.com',\n    password: 'password123'\n  });\n  \n  try {\n    const result = await user.save();\n    console.log(result);\n  } catch (err) {\n    console.error('Error creating user:', err.message);\n  }\n}\n\n// Query users\nasync function getUsers() {\n  try {\n    // Find all users\n    const users = await User.find();\n    console.log('All users:', users);\n    \n    // Find users with specific criteria\n    const admins = await User.find({ isAdmin: true })\n      .select('name email -_id') // Select only name and email, exclude _id\n      .sort('name'); // Sort by name\n    \n    console.log('Admins:', admins);\n  } catch (err) {\n    console.error('Error querying users:', err.message);\n  }\n}\n\ncreateUser();\ngetUsers();"
        },
        {
          type: "text",
          title: "CRUD Operations with Mongoose",
          content: "Mongoose provides a straightforward API for performing CRUD (Create, Read, Update, Delete) operations on your MongoDB collections. You can create documents using the model constructor and save(), read documents using find(), findById(), and findOne(), update documents using updateOne(), updateMany(), or findByIdAndUpdate(), and delete documents using deleteOne(), deleteMany(), or findByIdAndDelete()."
        },
        {
          type: "code",
          title: "Complete CRUD Example with Express and Mongoose",
          codeLanguage: "javascript",
          content: "const express = require('express');\nconst mongoose = require('mongoose');\nconst app = express();\nconst port = 3000;\n\n// Middleware\napp.use(express.json());\n\n// Connect to MongoDB\nmongoose.connect('mongodb://localhost:27017/bookstore', {\n  useNewUrlParser: true,\n  useUnifiedTopology: true\n})\n  .then(() => console.log('Connected to MongoDB'))\n  .catch(err => console.error('Could not connect to MongoDB', err));\n\n// Define Book schema and model\nconst bookSchema = new mongoose.Schema({\n  title: {\n    type: String,\n    required: true,\n    trim: true,\n    minlength: 3\n  },\n  author: {\n    type: String,\n    required: true,\n    trim: true\n  },\n  year: {\n    type: Number,\n    min: 1000,\n    max: new Date().getFullYear()\n  },\n  genres: [String],\n  rating: {\n    type: Number,\n    min: 1,\n    max: 5,\n    default: 3\n  },\n  createdAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\nconst Book = mongoose.model('Book', bookSchema);\n\n// GET all books\napp.get('/api/books', async (req, res) => {\n  try {\n    const books = await Book.find().sort('title');\n    res.json(books);\n  } catch (err) {\n    res.status(500).json({ message: err.message });\n  }\n});\n\n// GET a single book\napp.get('/api/books/:id', async (req, res) => {\n  try {\n    const book = await Book.findById(req.params.id);\n    if (!book) {\n      return res.status(404).json({ message: 'Book not found' });\n    }\n    res.json(book);\n  } catch (err) {\n    res.status(500).json({ message: err.message });\n  }\n});\n\n// POST a new book\napp.post('/api/books', async (req, res) => {\n  try {\n    const book = new Book(req.body);\n    const savedBook = await book.save();\n    res.status(201).json(savedBook);\n  } catch (err) {\n    res.status(400).json({ message: err.message });\n  }\n});\n\n// PUT (update) a book\napp.put('/api/books/:id', async (req, res) => {\n  try {\n    const book = await Book.findByIdAndUpdate(\n      req.params.id,\n      req.body,\n      { new: true, runValidators: true }\n    );\n    \n    if (!book) {\n      return res.status(404).json({ message: 'Book not found' });\n    }\n    \n    res.json(book);\n  } catch (err) {\n    res.status(400).json({ message: err.message });\n  }\n});\n\n// DELETE a book\napp.delete('/api/books/:id', async (req, res) => {\n  try {\n    const book = await Book.findByIdAndDelete(req.params.id);\n    \n    if (!book) {\n      return res.status(404).json({ message: 'Book not found' });\n    }\n    \n    res.json({ message: 'Book deleted successfully' });\n  } catch (err) {\n    res.status(500).json({ message: err.message });\n  }\n});\n\napp.listen(port, () => {\n  console.log(`Server running at http://localhost:${port}`);\n});"
        }
      ]
    },
    {
      title: "Authentication and Authorization",
      topic: "Node.js",
      duration: 45,
      content: [
        {
          type: "text",
          title: "Authentication Basics",
          content: "Authentication is the process of verifying who a user is, while authorization is the process of verifying what they have access to. In web applications, authentication typically involves validating user credentials (username/password) and creating a session or token that identifies the user for subsequent requests."
        },
        {
          type: "text",
          title: "JWT Authentication",
          content: "JSON Web Tokens (JWT) provide a stateless way to authenticate users. A JWT is a compact, self-contained token that can securely transmit information between parties. It consists of a header, payload, and signature. JWTs are commonly used for authentication and information exchange in web applications."
        },
        {
          type: "code",
          title: "JWT Authentication Implementation",
          codeLanguage: "javascript",
          content: "const express = require('express');\nconst mongoose = require('mongoose');\nconst bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\n\nconst app = express();\nconst port = 3000;\nconst JWT_SECRET = 'your-secret-key'; // In production, use environment variables\n\n// Middleware\napp.use(express.json());\n\n// Connect to MongoDB\nmongoose.connect('mongodb://localhost:27017/auth-demo', {\n  useNewUrlParser: true,\n  useUnifiedTopology: true\n})\n  .then(() => console.log('Connected to MongoDB'))\n  .catch(err => console.error('Could not connect to MongoDB', err));\n\n// User model\nconst userSchema = new mongoose.Schema({\n  username: {\n    type: String,\n    required: true,\n    unique: true,\n    trim: true,\n    minlength: 3\n  },\n  email: {\n    type: String,\n    required: true,\n    unique: true,\n    match: /^\\S+@\\S+\\.\\S+$/\n  },\n  password: {\n    type: String,\n    required: true,\n    minlength: 6\n  },\n  role: {\n    type: String,\n    enum: ['user', 'admin'],\n    default: 'user'\n  }\n});\n\nconst User = mongoose.model('User', userSchema);\n\n// Register a new user\napp.post('/api/register', async (req, res) => {\n  try {\n    const { username, email, password } = req.body;\n    \n    // Check if user already exists\n    const existingUser = await User.findOne({ $or: [{ email }, { username }] });\n    if (existingUser) {\n      return res.status(400).json({ message: 'User already exists' });\n    }\n    \n    // Hash password\n    const salt = await bcrypt.genSalt(10);\n    const hashedPassword = await bcrypt.hash(password, salt);\n    \n    // Create new user\n    const user = new User({\n      username,\n      email,\n      password: hashedPassword\n    });\n    \n    await user.save();\n    \n    res.status(201).json({ message: 'User registered successfully' });\n  } catch (err) {\n    res.status(500).json({ message: err.message });\n  }\n});\n\n// Login\napp.post('/api/login', async (req, res) => {\n  try {\n    const { username, password } = req.body;\n    \n    // Find user\n    const user = await User.findOne({ username });\n    if (!user) {\n      return res.status(400).json({ message: 'Invalid username or password' });\n    }\n    \n    // Validate password\n    const validPassword = await bcrypt.compare(password, user.password);\n    if (!validPassword) {\n      return res.status(400).json({ message: 'Invalid username or password' });\n    }\n    \n    // Create and sign JWT\n    const token = jwt.sign(\n      { id: user._id, username: user.username, role: user.role },\n      JWT_SECRET,\n      { expiresIn: '1h' }\n    );\n    \n    res.json({ token });\n  } catch (err) {\n    res.status(500).json({ message: err.message });\n  }\n});\n\n// Authentication middleware\nfunction authenticate(req, res, next) {\n  const token = req.header('x-auth-token');\n  \n  if (!token) {\n    return res.status(401).json({ message: 'Access denied. No token provided.' });\n  }\n  \n  try {\n    const decoded = jwt.verify(token, JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (err) {\n    res.status(400).json({ message: 'Invalid token.' });\n  }\n}\n\n// Authorization middleware\nfunction authorize(roles = []) {\n  return (req, res, next) => {\n    if (!req.user) {\n      return res.status(401).json({ message: 'Unauthorized' });\n    }\n    \n    if (roles.length && !roles.includes(req.user.role)) {\n      return res.status(403).json({ message: 'Forbidden' });\n    }\n    \n    next();\n  };\n}\n\n// Protected route - any authenticated user\napp.get('/api/profile', authenticate, async (req, res) => {\n  try {\n    const user = await User.findById(req.user.id).select('-password');\n    res.json(user);\n  } catch (err) {\n    res.status(500).json({ message: err.message });\n  }\n});\n\n// Protected route - admin only\napp.get('/api/admin', [authenticate, authorize(['admin'])], (req, res) => {\n  res.json({ message: 'Admin dashboard' });\n});\n\napp.listen(port, () => {\n  console.log(`Server running at http://localhost:${port}`);\n});"
        },
        {
          type: "text",
          title: "OAuth 2.0",
          content: "OAuth 2.0 is an authorization framework that enables third-party applications to obtain limited access to a user's account on an HTTP service. It's commonly used for 'Sign in with Google/Facebook/GitHub' functionality. OAuth 2.0 delegates user authentication to the service that hosts the user account and authorizes third-party applications to access that account."
        },
        {
          type: "text",
          title: "Security Best Practices",
          content: "When implementing authentication and authorization, follow these best practices: use HTTPS, hash passwords with bcrypt or Argon2, implement rate limiting to prevent brute force attacks, use secure HTTP headers, validate and sanitize all input, implement proper error handling, use environment variables for secrets, and keep dependencies updated to patch security vulnerabilities."
        }
      ]
    }
  ],
  
  // CSS Mastery: Modern Styling Techniques - New frontend course with 5 lessons
  [
    {
      title: "CSS Fundamentals Refresher",
      topic: "CSS Basics",
      duration: 25,
      content: [
        {
          type: "text",
          title: "The Role of CSS in Web Development",
          content: "CSS (Cascading Style Sheets) is the language we use to style HTML documents. It describes how HTML elements should be displayed on screen, on paper, or in other media. CSS saves a lot of work by allowing you to control the layout of multiple web pages all at once."
        },
        {
          type: "code",
          title: "CSS Syntax Basics",
          codeLanguage: "css",
          content: "/* Basic CSS syntax */\nselector {\n  property: value;\n  another-property: value;\n}\n\n/* Example: styling paragraphs */\np {\n  color: #333333;\n  font-size: 16px;\n  line-height: 1.5;\n  margin-bottom: 1rem;\n}"
        },
        {
          type: "text",
          title: "Selectors and Specificity",
          content: "CSS selectors are patterns used to select and style HTML elements. Understanding selector specificity is crucial - it's the means by which browsers decide which CSS property values are the most relevant to an element and will be applied. The more specific a selector, the higher its priority."
        },
        {
          type: "code",
          title: "Different Types of Selectors",
          codeLanguage: "css",
          content: "/* Element selector */\nh1 {\n  font-size: 2rem;\n}\n\n/* Class selector */\n.highlight {\n  background-color: yellow;\n}\n\n/* ID selector */\n#header {\n  position: sticky;\n  top: 0;\n}\n\n/* Attribute selector */\ninput[type=\"text\"] {\n  border-radius: 4px;\n}\n\n/* Pseudo-class selector */\na:hover {\n  text-decoration: underline;\n}"
        },
        {
          type: "text",
          title: "The Box Model",
          content: "Every HTML element is treated as a box in CSS. The CSS box model describes this principle and consists of margins, borders, padding, and the actual content. Understanding how these properties interact is fundamental to mastering CSS layout."
        }
      ]
    },
    {
      title: "Flexbox Layout",
      topic: "Modern CSS",
      duration: 30,
      content: [
        {
          type: "text",
          title: "Introduction to Flexbox",
          content: "Flexbox (Flexible Box Module) is a one-dimensional layout method designed for laying out items in rows or columns. It makes building flexible responsive layout structures without using float or positioning much easier. Flexbox is particularly good at distributing space and aligning items in a container, even when their size is unknown or dynamic."
        },
        {
          type: "code",
          title: "Basic Flexbox Container",
          codeLanguage: "css",
          content: "/* Creating a flex container */\n.container {\n  display: flex;\n  flex-direction: row; /* default: items laid out in a row */\n  justify-content: space-between; /* distributes items evenly */\n  align-items: center; /* centers items vertically */\n  flex-wrap: wrap; /* allows items to wrap to next line */\n  gap: 20px; /* space between items */\n}"
        },
        {
          type: "text",
          title: "Flex Items Properties",
          content: "While the parent container defines the flex context, individual flex items can have their own properties that determine how they behave within that context. These properties control how items grow, shrink, and align themselves."
        },
        {
          type: "code",
          title: "Controlling Flex Items",
          codeLanguage: "css",
          content: "/* Flex item properties */\n.item {\n  flex-grow: 1; /* ability to grow if necessary */\n  flex-shrink: 1; /* ability to shrink if necessary */\n  flex-basis: auto; /* default size before space distribution */\n  \n  /* Shorthand for the above three properties */\n  flex: 1 1 auto;\n  \n  /* Self-alignment (overrides container's align-items) */\n  align-self: flex-start;\n  \n  /* Control order of items */\n  order: 2;\n}"
        },
        {
          type: "text",
          title: "Real-world Flexbox Examples",
          content: "Flexbox is perfect for many common layout patterns. Here are some practical uses: navigation bars, card layouts, centering elements, form layouts, and creating equal-height columns. The flexibility of flexbox makes it an essential tool in modern web design."
        }
      ]
    },
    {
      title: "CSS Grid Layout",
      topic: "Modern CSS",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Understanding CSS Grid",
          content: "CSS Grid Layout is a two-dimensional layout system designed for the web. It lets you lay out items in rows and columns, and has many features that make building complex layouts straightforward. While Flexbox is one-dimensional, Grid is two-dimensional, making it ideal for page layouts and complex components."
        },
        {
          type: "code",
          title: "Creating a Basic Grid",
          codeLanguage: "css",
          content: "/* Basic grid container */\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */\n  grid-template-rows: auto auto; /* 2 rows, height based on content */\n  gap: 20px; /* spacing between grid items */\n}"
        },
        {
          type: "text",
          title: "Grid Placement Properties",
          content: "One of the powerful features of CSS Grid is the ability to precisely place items within the grid. You can specify which row and column an item should start and end on, allowing for complex layouts without nested markup."
        },
        {
          type: "code",
          title: "Placing Items in the Grid",
          codeLanguage: "css",
          content: "/* Grid item placement */\n.header {\n  grid-column: 1 / -1; /* Span all columns */\n  grid-row: 1; /* First row */\n}\n\n.sidebar {\n  grid-column: 1; /* First column */\n  grid-row: 2 / span 2; /* Start at row 2, span 2 rows */\n}\n\n.main-content {\n  grid-column: 2 / 4; /* From column 2 to 4 */\n  grid-row: 2; /* Second row */\n}\n\n.footer {\n  grid-column: 1 / -1; /* Span all columns */\n  grid-row: 4; /* Fourth row */\n}"
        },
        {
          type: "text",
          title: "Responsive Grids with minmax() and auto-fill",
          content: "CSS Grid includes powerful functions like minmax() and auto-fill/auto-fit that make creating responsive layouts much easier. These allow you to build grids that automatically adjust based on available space, without requiring media queries for every breakpoint."
        }
      ]
    },
    {
      title: "Responsive Design and Media Queries",
      topic: "Modern CSS",
      duration: 30,
      content: [
        {
          type: "text",
          title: "Principles of Responsive Design",
          content: "Responsive web design is an approach that makes web pages render well on a variety of devices and window or screen sizes. The core principles include fluid layouts, flexible images, and media queries. The goal is to build websites that provide an optimal viewing experience across a wide range of devices."
        },
        {
          type: "code",
          title: "Setting Up the Viewport",
          codeLanguage: "html",
          content: "<!-- Essential viewport meta tag -->\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
        },
        {
          type: "text",
          title: "Understanding Media Queries",
          content: "Media queries allow you to apply CSS styles based on device characteristics, such as screen width, height, orientation, or resolution. They are the cornerstone of responsive design, enabling you to create different layouts for different screen sizes."
        },
        {
          type: "code",
          title: "Basic Media Query Examples",
          codeLanguage: "css",
          content: "/* Base styles for all devices */\nbody {\n  font-size: 16px;\n  line-height: 1.5;\n}\n\n/* Styles for tablets */\n@media (max-width: 768px) {\n  body {\n    font-size: 14px;\n  }\n  \n  .container {\n    padding: 0 20px;\n  }\n}\n\n/* Styles for mobile phones */\n@media (max-width: 480px) {\n  body {\n    font-size: 12px;\n  }\n  \n  .nav-menu {\n    display: none; /* Hide desktop navigation */\n  }\n  \n  .mobile-menu {\n    display: block; /* Show mobile navigation */\n  }\n}"
        },
        {
          type: "text",
          title: "Mobile-First vs. Desktop-First",
          content: "There are two main approaches to responsive design: mobile-first and desktop-first. Mobile-first means designing for mobile devices first, then progressively enhancing for larger screens. Desktop-first is the opposite approach. Mobile-first is generally recommended as it forces you to focus on content priorities and performance."
        }
      ]
    },
    {
      title: "Modern CSS Features and Best Practices",
      topic: "Advanced CSS",
      duration: 40,
      content: [
        {
          type: "text",
          title: "CSS Variables (Custom Properties)",
          content: "CSS Variables, officially called Custom Properties, allow you to store specific values to reuse throughout your stylesheet. They help maintain consistency, make global changes easier, and can even be manipulated with JavaScript. They're particularly useful for theme colors, spacing values, and other repeated values."
        },
        {
          type: "code",
          title: "Using CSS Variables",
          codeLanguage: "css",
          content: "/* Defining variables in the root scope */\n:root {\n  --primary-color: #6366F1;\n  --secondary-color: #818CF8;\n  --text-color: #333333;\n  --spacing-unit: 8px;\n  --border-radius: 4px;\n}\n\n/* Using variables */\n.button {\n  background-color: var(--primary-color);\n  color: white;\n  padding: calc(var(--spacing-unit) * 2);\n  border-radius: var(--border-radius);\n}\n\n.button:hover {\n  background-color: var(--secondary-color);\n}"
        },
        {
          type: "text",
          title: "CSS Animations and Transitions",
          content: "CSS animations and transitions allow you to create smooth, engaging user experiences without JavaScript. Transitions provide a way to control animation speed when changing CSS properties, while animations allow for more complex movements and transformations."
        },
        {
          type: "code",
          title: "Transitions and Animations",
          codeLanguage: "css",
          content: "/* Simple transition */\n.button {\n  background-color: #6366F1;\n  transition: background-color 0.3s ease, transform 0.2s ease;\n}\n\n.button:hover {\n  background-color: #818CF8;\n  transform: translateY(-2px);\n}\n\n/* Keyframe animation */\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.fade-in-element {\n  animation: fadeIn 1s ease-in-out;\n}"
        },
        {
          type: "text",
          title: "Modern CSS Layout Techniques",
          content: "Beyond Flexbox and Grid, modern CSS offers many powerful layout techniques. These include multi-column layout for text-heavy content, CSS shapes for wrapping text around custom shapes, and position: sticky for elements that toggle between relative and fixed positioning based on scroll position."
        }
      ]
    }
  ]
];

// Add these to your lessonsTemplate array
const additionalLessonsTemplate = [

  // Advanced TypeScript lessons
  [
    {
      title: "Advanced Types in TypeScript",
      topic: "TypeScript Advanced",
      duration: 40,
      content: [
        {
          type: "text",
          title: "Type Manipulation",
          content: "TypeScript's type system allows for powerful type manipulation techniques that help create more flexible and reusable code."
        },
        {
          type: "code",
          title: "Union and Intersection Types",
          codeLanguage: "typescript",
          content: "// Union types\ntype StringOrNumber = string | number;\n\nfunction displayId(id: StringOrNumber) {\n  console.log(`ID: ${id}`);\n}\n\ndisplayId(101);      // Works with numbers\ndisplayId('A101');   // Works with strings\n\n// Intersection types\ntype Employee = {\n  id: number;\n  name: string;\n};\n\ntype Manager = {\n  employees: Employee[];\n  department: string;\n};\n\ntype ManagerWithContact = Manager & {\n  email: string;\n  phone: string;\n};\n\nconst director: ManagerWithContact = {\n  employees: [{ id: 1, name: 'Alice' }],\n  department: 'Engineering',\n  email: 'director@company.com',\n  phone: '555-1234'\n};"
        },
        {
          type: "code",
          title: "Mapped Types and Conditional Types",
          codeLanguage: "typescript",
          content: "// Mapped Types\ntype Readonly<T> = {\n  readonly [P in keyof T]: T[P];\n};\n\ninterface Person {\n  name: string;\n  age: number;\n}\n\nconst readonlyPerson: Readonly<Person> = {\n  name: 'John',\n  age: 30\n};\n\n// This would cause an error\n// readonlyPerson.name = 'Jane';\n\n// Conditional Types\ntype ExtractString<T> = T extends string ? T : never;\n\ntype StringOnly = ExtractString<string | number | boolean>;\n// StringOnly is equivalent to just 'string'"
        },
        {
          type: "text",
          title: "Utility Types",
          content: "TypeScript provides several utility types to facilitate common type transformations. These include Partial<T>, Required<T>, Pick<T, K>, Omit<T, K>, and more."
        },
        {
          type: "code",
          title: "Using Utility Types",
          codeLanguage: "typescript",
          content: "interface User {\n  id: number;\n  name: string;\n  email: string;\n  address: string;\n  phone?: string;\n}\n\n// Partial - all properties become optional\nfunction updateUser(userId: number, updates: Partial<User>) {\n  // Update only the specified fields\n}\n\n// Pick - select only certain properties\ntype ContactInfo = Pick<User, 'email' | 'phone' | 'address'>;\n\n// Omit - exclude certain properties\ntype PublicUserInfo = Omit<User, 'id' | 'email'>;\n\n// Required - make all properties required\ntype AdminUser = Required<User>;"
        }
      ]
    },
    {
      title: "Generics and Type Inference",
      topic: "TypeScript Advanced",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Generic Types",
          content: "Generics allow you to create reusable components that work with a variety of types rather than a single one. This enables type-safe flexibility."
        },
        {
          type: "code",
          title: "Generic Functions and Classes",
          codeLanguage: "typescript",
          content: "// Generic function\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst num = identity<number>(42);   // num is number\nconst str = identity('hello');      // Type inference works too!\n\n// Generic class\nclass Queue<T> {\n  private data: T[] = [];\n  \n  push(item: T): void {\n    this.data.push(item);\n  }\n  \n  pop(): T | undefined {\n    return this.data.shift();\n  }\n}\n\nconst numberQueue = new Queue<number>();\nnumberQueue.push(10);\nnumberQueue.push(20);\nconst num1 = numberQueue.pop();  // num1 is number"
        },
        {
          type: "text",
          title: "Constraints and Defaults",
          content: "Generic type constraints allow you to restrict the types that can be used with your generic function or class."
        },
        {
          type: "code",
          title: "Generic Constraints",
          codeLanguage: "typescript",
          content: "// Using extends to constrain types\ninterface HasLength {\n  length: number;\n}\n\nfunction logLength<T extends HasLength>(arg: T): T {\n  console.log(arg.length);  // We can safely access .length\n  return arg;\n}\n\n// Works with strings (they have .length)\nlogLength('hello');\n\n// Works with arrays (they have .length)\nlogLength([1, 2, 3]);\n\n// Would NOT work with numbers\n// logLength(42);  // Error: number doesn't have .length\n\n// Default type parameters\nfunction createState<T = string>(): [T | undefined, (value: T) => void] {\n  let state: T | undefined;\n  \n  function setState(value: T) {\n    state = value;\n  }\n  \n  return [state, setState];\n}\n\nconst [state, setState] = createState();  // defaults to string\nsetState('hello');  // works\n// setState(42);  // error"
        }
      ]
    }
  ],
  
  // Mobile Development with React Native lessons
  [
    {
      title: "React Native Fundamentals",
      topic: "React Native",
      duration: 30,
      content: [
        {
          type: "text",
          title: "Introduction to React Native",
          content: "React Native is a framework for building native mobile applications using JavaScript and React. It allows you to create apps for both iOS and Android from a single codebase."
        },
        {
          type: "code",
          title: "Your First React Native Component",
          codeLanguage: "jsx",
          content: "import React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\n\nconst HelloWorld = () => {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.text}>Hello, React Native!</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n    backgroundColor: '#F5FCFF',\n  },\n  text: {\n    fontSize: 20,\n    textAlign: 'center',\n    margin: 10,\n  },\n});\n\nexport default HelloWorld;"
        },
        {
          type: "text",
          title: "Core Components",
          content: "React Native provides a set of core components that map directly to native UI elements. These include View, Text, Image, ScrollView, TextInput, and more."
        },
        {
          type: "code",
          title: "Using Core Components",
          codeLanguage: "jsx",
          content: "import React, { useState } from 'react';\nimport { View, Text, TextInput, Image, ScrollView, StyleSheet } from 'react-native';\n\nconst CoreComponentsDemo = () => {\n  const [inputText, setInputText] = useState('');\n\n  return (\n    <ScrollView style={styles.container}>\n      <Text style={styles.heading}>Core Components Demo</Text>\n      \n      <Text style={styles.label}>TextInput Component:</Text>\n      <TextInput\n        style={styles.input}\n        placeholder=\"Type something here\"\n        value={inputText}\n        onChangeText={setInputText}\n      />\n      \n      <Text style={styles.label}>Your input: {inputText}</Text>\n      \n      <Text style={styles.label}>Image Component:</Text>\n      <Image\n        source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}\n        style={styles.image}\n      />\n    </ScrollView>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    padding: 20,\n  },\n  heading: {\n    fontSize: 24,\n    fontWeight: 'bold',\n    marginBottom: 20,\n  },\n  label: {\n    fontSize: 16,\n    marginVertical: 10,\n  },\n  input: {\n    height: 40,\n    borderWidth: 1,\n    borderColor: '#cccccc',\n    borderRadius: 5,\n    paddingHorizontal: 10,\n    marginBottom: 10,\n  },\n  image: {\n    width: 100,\n    height: 100,\n    resizeMode: 'contain',\n  },\n});\n\nexport default CoreComponentsDemo;"
        }
      ]
    },
    {
      title: "Styling and Layout in React Native",
      topic: "React Native",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Flexbox Layout",
          content: "React Native uses Flexbox for layout, similar to web development but with some differences. Understanding flex properties is essential for creating responsive layouts."
        },
        {
          type: "code",
          title: "Flexbox Examples",
          codeLanguage: "jsx",
          content: "import React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\n\nconst FlexboxDemo = () => {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.heading}>Flexbox Layout</Text>\n      \n      <Text style={styles.sectionTitle}>Row with space-between:</Text>\n      <View style={styles.rowSpaceBetween}>\n        <View style={[styles.box, { backgroundColor: '#FF5252' }]} />\n        <View style={[styles.box, { backgroundColor: '#2196F3' }]} />\n        <View style={[styles.box, { backgroundColor: '#4CAF50' }]} />\n      </View>\n      \n      <Text style={styles.sectionTitle}>Column with alignItems center:</Text>\n      <View style={styles.columnAlignCenter}>\n        <View style={[styles.box, { backgroundColor: '#FFC107', width: 50 }]} />\n        <View style={[styles.box, { backgroundColor: '#9C27B0', width: 100 }]} />\n        <View style={[styles.box, { backgroundColor: '#00BCD4', width: 150 }]} />\n      </View>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    padding: 20,\n  },\n  heading: {\n    fontSize: 24,\n    fontWeight: 'bold',\n    marginBottom: 20,\n  },\n  sectionTitle: {\n    fontSize: 16,\n    marginVertical: 10,\n  },\n  rowSpaceBetween: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    marginBottom: 20,\n  },\n  columnAlignCenter: {\n    height: 200,\n    flexDirection: 'column',\n    alignItems: 'center',\n    justifyContent: 'space-around',\n    backgroundColor: '#f0f0f0',\n  },\n  box: {\n    width: 50,\n    height: 50,\n  },\n});\n\nexport default FlexboxDemo;"
        },
        {
          type: "text",
          title: "Styling in React Native",
          content: "Styling in React Native is done using JavaScript objects that resemble CSS but use camelCase property names. Styles can be applied inline or using StyleSheet.create()."
        },
        {
          type: "code",
          title: "Style Methods and Inheritance",
          codeLanguage: "jsx",
          content: "import React from 'react';\nimport { View, Text, StyleSheet, Platform } from 'react-native';\n\nconst StylingDemo = () => {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.heading}>Styling Methods</Text>\n      \n      {/* Inline styles */}\n      <Text style={{ fontSize: 16, color: 'blue', marginBottom: 10 }}>\n        This text uses inline styling\n      </Text>\n      \n      {/* StyleSheet styles */}\n      <Text style={styles.standardText}>\n        This text uses StyleSheet styling\n      </Text>\n      \n      {/* Multiple styles */}\n      <Text style={[styles.standardText, styles.highlightedText]}>\n        This text combines multiple styles\n      </Text>\n      \n      {/* Platform-specific styles */}\n      <Text style={styles.platformSpecific}>\n        This has platform-specific styling\n      </Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    padding: 20,\n    backgroundColor: '#f9f9f9',\n  },\n  heading: {\n    fontSize: 22,\n    fontWeight: 'bold',\n    marginBottom: 20,\n    color: '#333',\n  },\n  standardText: {\n    fontSize: 16,\n    color: '#555',\n    marginBottom: 10,\n  },\n  highlightedText: {\n    backgroundColor: '#FFFDE7',\n    fontWeight: 'bold',\n    padding: 5,\n    borderRadius: 4,\n  },\n  platformSpecific: {\n    ...Platform.select({\n      ios: {\n        fontFamily: 'Helvetica',\n        fontSize: 18,\n        color: '#007AFF',\n      },\n      android: {\n        fontFamily: 'Roboto',\n        fontSize: 18,\n        color: '#4CAF50',\n      },\n    }),\n    marginTop: 20,\n  },\n});\n\nexport default StylingDemo;"
        }
      ]
    }
  ],
  
  // GraphQL API Development lessons
  [
    {
      title: "Introduction to GraphQL",
      topic: "GraphQL",
      duration: 30,
      content: [
        {
          type: "text",
          title: "What is GraphQL?",
          content: "GraphQL is a query language for APIs and a runtime for executing those queries with your existing data. It provides a more efficient, powerful and flexible alternative to REST."
        },
        {
          type: "text",
          title: "Key Concepts",
          content: "GraphQL has three main operation types: queries (for fetching data), mutations (for creating, updating, and deleting data), and subscriptions (for real-time updates). It uses a schema to define the structure of your data and the operations that can be performed."
        },
        {
          type: "code",
          title: "Basic GraphQL Schema",
          codeLanguage: "graphql",
          content: "# Type definitions\ntype User {\n  id: ID!\n  username: String!\n  email: String!\n  posts: [Post!]!\n}\n\ntype Post {\n  id: ID!\n  title: String!\n  content: String!\n  published: Boolean!\n  author: User!\n}\n\n# Query type defines available queries\ntype Query {\n  users: [User!]!\n  user(id: ID!): User\n  posts: [Post!]!\n  post(id: ID!): Post\n}\n\n# Mutation type defines operations that change data\ntype Mutation {\n  createUser(username: String!, email: String!): User!\n  createPost(title: String!, content: String!, authorId: ID!): Post!\n  publishPost(id: ID!): Post!\n}"
        },
        {
          type: "code",
          title: "GraphQL Queries",
          codeLanguage: "graphql",
          content: "# Basic query fetching users\nquery GetUsers {\n  users {\n    id\n    username\n    email\n  }\n}\n\n# Query with arguments and nested fields\nquery GetUserWithPosts($userId: ID!) {\n  user(id: $userId) {\n    id\n    username\n    email\n    posts {\n      id\n      title\n      published\n    }\n  }\n}\n\n# Variables for the above query\n{\n  \"userId\": \"123\"\n}"
        }
      ]
    },
    {
      title: "Building a GraphQL Server with Node.js",
      topic: "GraphQL",
      duration: 45,
      content: [
        {
          type: "text",
          title: "Setting up Apollo Server",
          content: "Apollo Server is a community-driven, open-source GraphQL server that works with any GraphQL schema. It's a great way to build a GraphQL API that connects to one or more data sources."
        },
        {
          type: "code",
          title: "Basic Apollo Server Setup",
          codeLanguage: "javascript",
          content: "const { ApolloServer, gql } = require('apollo-server');\n\n// Define schema using GraphQL schema language\nconst typeDefs = gql`\n  type Book {\n    id: ID!\n    title: String!\n    author: String!\n  }\n\n  type Query {\n    books: [Book!]!\n    book(id: ID!): Book\n  }\n`;\n\n// Sample data\nconst books = [\n  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },\n  { id: '2', title: '1984', author: 'George Orwell' },\n  { id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee' },\n];\n\n// Resolvers define how to fetch the types defined in your schema\nconst resolvers = {\n  Query: {\n    books: () => books,\n    book: (_, { id }) => books.find(book => book.id === id),\n  },\n};\n\n// Create Apollo Server instance\nconst server = new ApolloServer({ typeDefs, resolvers });\n\n// Start the server\nserver.listen().then(({ url }) => {\n  console.log(`🚀 Server ready at ${url}`);\n});"
        },
        {
          type: "text",
          title: "Resolvers",
          content: "Resolvers are functions that determine how the data for a field in your schema is fetched. They match the structure of your schema and can retrieve data from any source (database, API, etc.)."
        },
        {
          type: "code",
          title: "Advanced Resolvers",
          codeLanguage: "javascript",
          content: "const { ApolloServer, gql } = require('apollo-server');\n\n// Schema definition\nconst typeDefs = gql`\n  type User {\n    id: ID!\n    name: String!\n    posts: [Post!]!\n  }\n\n  type Post {\n    id: ID!\n    title: String!\n    body: String!\n    author: User!\n  }\n\n  type Query {\n    users: [User!]!\n    user(id: ID!): User\n    posts: [Post!]!\n    post(id: ID!): Post\n  }\n`;\n\n// Sample data\nconst users = [\n  { id: '1', name: 'John Doe' },\n  { id: '2', name: 'Jane Smith' },\n];\n\nconst posts = [\n  { id: '1', title: 'GraphQL Basics', body: 'Learn about GraphQL...', authorId: '1' },\n  { id: '2', title: 'Apollo Server', body: 'Setting up Apollo Server...', authorId: '1' },\n  { id: '3', title: 'Resolver Functions', body: 'How resolvers work...', authorId: '2' },\n];\n\n// Resolvers\nconst resolvers = {\n  Query: {\n    users: () => users,\n    user: (_, { id }) => users.find(user => user.id === id),\n    posts: () => posts,\n    post: (_, { id }) => posts.find(post => post.id === id),\n  },\n  User: {\n    // Resolver for User.posts\n    posts: (parent) => posts.filter(post => post.authorId === parent.id),\n  },\n  Post: {\n    // Resolver for Post.author\n    author: (parent) => users.find(user => user.id === parent.authorId),\n  },\n};\n\n// Create and start server\nconst server = new ApolloServer({ typeDefs, resolvers });\nserver.listen().then(({ url }) => {\n  console.log(`🚀 Server ready at ${url}`);\n});"
        }
      ]
    }
  ],
  
  // DevOps Fundamentals lessons
  [
    {
      title: "Introduction to Docker",
      topic: "DevOps",
      duration: 35,
      content: [
        {
          type: "text",
          title: "What is Docker?",
          content: "Docker is a platform for developing, shipping, and running applications in containers. Containers are lightweight, portable, and consistent environments that package an application with all its dependencies."
        },
        {
          type: "text",
          title: "Benefits of Containerization",
          content: "Containerization offers several advantages: consistent environments across development and production, isolation from other applications, faster deployment, better resource utilization, and easier scaling."
        },
        {
          type: "code",
          title: "Basic Dockerfile",
          codeLanguage: "dockerfile",
          content: "# Use an official Node.js runtime as a base image\nFROM node:14\n\n# Set the working directory\nWORKDIR /app\n\n# Copy package.json and package-lock.json\nCOPY package*.json ./\n\n# Install dependencies\nRUN npm install\n\n# Copy application code\nCOPY . .\n\n# Expose the port the app runs on\nEXPOSE 3000\n\n# Command to run the application\nCMD [\"npm\", \"start\"]"
        },
        {
          type: "code",
          title: "Docker Commands",
          codeLanguage: "bash",
          content: "# Build an image\ndocker build -t my-app .\n\n# Run a container\ndocker run -p 3000:3000 my-app\n\n# List running containers\ndocker ps\n\n# Stop a container\ndocker stop <container_id>\n\n# List all images\ndocker images\n\n# Remove an image\ndocker rmi <image_id>"
        }
      ]
    },
    {
      title: "CI/CD Pipelines",
      topic: "DevOps",
      duration: 40,
      content: [
        {
          type: "text",
          title: "Continuous Integration and Delivery",
          content: "CI/CD (Continuous Integration/Continuous Delivery) is a method to frequently deliver apps to customers by introducing automation into the stages of app development. The main concepts are: continuous integration, continuous delivery, and continuous deployment."
        },
        {
          type: "text",
          title: "Benefits of CI/CD",
          content: "CI/CD pipelines automate your software delivery process. The pipeline builds code, runs tests, and safely deploys a new version of the application. Benefits include faster delivery of features, more time for innovation, better products, and happier teams."
        },
        {
          type: "code",
          title: "GitHub Actions Workflow Example",
          codeLanguage: "yaml",
          content: "name: Node.js CI/CD\n\non:\n  push:\n    branches: [ main ]\n  pull_request:\n    branches: [ main ]\n\njobs:\n  build_and_test:\n    runs-on: ubuntu-latest\n\n    strategy:\n      matrix:\n        node-version: [14.x, 16.x]\n\n    steps:\n    - uses: actions/checkout@v2\n    - name: Use Node.js ${{ matrix.node-version }}\n      uses: actions/setup-node@v2\n      with:\n        node-version: ${{ matrix.node-version }}\n    - name: Install dependencies\n      run: npm ci\n    - name: Run linter\n      run: npm run lint\n    - name: Run tests\n      run: npm test\n    - name: Build\n      run: npm run build\n\n  deploy:\n    needs: build_and_test\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'\n    \n    steps:\n    - uses: actions/checkout@v2\n    - name: Deploy to production\n      run: |\n        echo \"Deploying to production server\"\n        # Add deployment commands here"
        },
        {
          type: "text",
          title: "Best Practices for CI/CD",
          content: "To get the most out of CI/CD, follow these practices: Keep the build fast, test in a production clone environment, deploy the same way to every environment, make the deployment process repeatable, and keep improving your pipeline."
        }
      ]
    },
    {
      title: "Cloud Deployment",
      topic: "DevOps",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Introduction to Cloud Services",
          content: "Cloud computing provides on-demand computing resources over the internet. The three main service models are Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS)."
        },
        {
          type: "text",
          title: "Major Cloud Providers",
          content: "The major cloud providers are Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Each offers a variety of services for computing, storage, databases, networking, analytics, machine learning, and more."
        },
        {
          type: "code",
          title: "AWS S3 Static Website Deployment",
          codeLanguage: "javascript",
          content: "// Using AWS SDK for JavaScript\nconst AWS = require('aws-sdk');\nconst fs = require('fs');\nconst path = require('path');\n\n// Configure AWS\nAWS.config.update({\n  region: 'us-east-1',\n  // Credentials should be handled securely, e.g., via environment variables\n});\n\nconst s3 = new AWS.S3();\nconst BUCKET_NAME = 'my-static-website';\n\n// Function to upload a file to S3\nasync function uploadFile(filePath) {\n  const fileContent = fs.readFileSync(filePath);\n  const fileName = path.basename(filePath);\n  \n  const params = {\n    Bucket: BUCKET_NAME,\n    Key: fileName,\n    Body: fileContent,\n    ContentType: getContentType(fileName)\n  };\n  \n  try {\n    const data = await s3.upload(params).promise();\n    console.log(`File uploaded successfully: ${data.Location}`);\n  } catch (error) {\n    console.error(`Error uploading file: ${error}`);\n  }\n}\n\n// Helper to determine content type\nfunction getContentType(filename) {\n  const ext = path.extname(filename).toLowerCase();\n  switch(ext) {\n    case '.html': return 'text/html';\n    case '.css': return 'text/css';\n    case '.js': return 'application/javascript';\n    case '.png': return 'image/png';\n    case '.jpg': case '.jpeg': return 'image/jpeg';\n    default: return 'application/octet-stream';\n  }\n}\n\n// Example usage\nuploadFile('index.html');"
        },
        {
          type: "text",
          title: "Serverless Computing",
          content: "Serverless computing is a cloud execution model where the cloud provider manages the infrastructure. It allows developers to build and run applications without thinking about servers. You pay only for the compute time you consume."
        },
        {
          type: "code",
          title: "AWS Lambda Function Example",
          codeLanguage: "javascript",
          content: "// AWS Lambda function that processes an image when uploaded to S3\nexports.handler = async (event) => {\n  // Get the object from the event\n  const bucket = event.Records[0].s3.bucket.name;\n  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\\+/g, ' '));\n  \n  console.log(`Image uploaded to bucket ${bucket} with key ${key}`);\n  \n  try {\n    // Here you would typically process the image\n    // e.g., resize it, extract metadata, etc.\n    console.log('Processing image...');\n    \n    // Example response\n    return {\n      statusCode: 200,\n      body: JSON.stringify({\n        message: 'Image processed successfully',\n        bucket: bucket,\n        key: key\n      }),\n    };\n  } catch (error) {\n    console.error(`Error processing image: ${error}`);\n    return {\n      statusCode: 500,\n      body: JSON.stringify({\n        message: 'Error processing image',\n        error: error.message\n      }),\n    };\n  }\n};"
        }
      ]
    }
  ],
  
  // Mobile Development Lessons
  [
    {
      title: "Introduction to Mobile App Development",
      topic: "Mobile Development",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Mobile Development Overview",
          content: "Mobile app development involves creating applications for mobile devices like smartphones and tablets. There are several approaches: native development (iOS/Android), cross-platform frameworks (React Native, Flutter), and hybrid solutions (Ionic, PhoneGap). Each approach has its own advantages and trade-offs."
        },
        {
          type: "text",
          title: "Development Approaches",
          content: "Native apps offer the best performance and full platform features but require platform-specific knowledge. Cross-platform frameworks allow you to write code once and deploy to multiple platforms. Hybrid apps use web technologies wrapped in a native container."
        },
        {
          type: "code",
          title: "Basic App Structure (React Native)",
          codeLanguage: "jsx",
          content: "import React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\n\nconst App = () => {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Welcome to Mobile Development!</Text>\n      <Text style={styles.subtitle}>Build once, run everywhere</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n    backgroundColor: '#F5FCFF',\n  },\n  title: {\n    fontSize: 20,\n    fontWeight: 'bold',\n    marginBottom: 10,\n  },\n  subtitle: {\n    fontSize: 16,\n    color: '#333',\n  },\n});\n\nexport default App;"
        }
      ]
    },
    {
      title: "Flutter Fundamentals",
      topic: "Mobile Development",
      duration: 40,
      content: [
        {
          type: "text",
          title: "What is Flutter?",
          content: "Flutter is Google's UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase. It uses the Dart programming language and provides rich widgets for building beautiful interfaces."
        },
        {
          type: "code",
          title: "First Flutter App",
          codeLanguage: "dart",
          content: "import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(\n          title: Text('My First Flutter App'),\n        ),\n        body: Center(\n          child: Column(\n            mainAxisAlignment: MainAxisAlignment.center,\n            children: [\n              Text(\n                'Welcome to Flutter!',\n                style: TextStyle(fontSize: 24),\n              ),\n              SizedBox(height: 20),\n              ElevatedButton(\n                onPressed: () {\n                  print('Button pressed!');\n                },\n                child: Text('Click Me'),\n              ),\n            ],\n          ),\n        ),\n      ),\n    );\n  }\n}"
        },
        {
          type: "text",
          title: "Widget Tree",
          content: "Flutter uses a widget tree to build UIs. Everything in Flutter is a widget, from layout elements to animations. Widgets can be either stateless (immutable) or stateful (can change over time)."
        }
      ]
    },
    {
      title: "iOS Development with Swift",
      topic: "Mobile Development",
      duration: 45,
      content: [
        {
          type: "text",
          title: "Introduction to Swift",
          content: "Swift is Apple's modern programming language for iOS, macOS, watchOS, and tvOS development. It's designed to be safe, fast, and expressive. Swift builds on the best of C and Objective-C, without the constraints of C compatibility."
        },
        {
          type: "code",
          title: "Basic Swift UI",
          codeLanguage: "swift",
          content: "import SwiftUI\n\nstruct ContentView: View {\n    @State private var name = \"\"\n    \n    var body: some View {\n        VStack {\n            Text(\"Hello, iOS Development!\")\n                .font(.title)\n                .padding()\n            \n            TextField(\"Enter your name\", text: $name)\n                .textFieldStyle(RoundedBorderTextFieldStyle())\n                .padding()\n            \n            Button(action: {\n                print(\"Hello, \\(name)!\")\n            }) {\n                Text(\"Greet\")\n                    .padding()\n                    .background(Color.blue)\n                    .foregroundColor(.white)\n                    .cornerRadius(10)\n            }\n        }\n        .padding()\n    }\n}"
        }
      ]
    },
    {
      title: "Mobile UI/UX Design",
      topic: "Mobile Development",
      duration: 35,
      content: [
        {
          type: "text",
          title: "Mobile Design Principles",
          content: "Mobile UI/UX design requires special consideration for screen size, touch interactions, and device capabilities. Key principles include designing for thumb zones, maintaining consistency, providing clear feedback, and ensuring good contrast and readability."
        },
        {
          type: "code",
          title: "Responsive Layout Example",
          codeLanguage: "jsx",
          content: "import { StyleSheet, Dimensions } from 'react-native';\n\nconst windowWidth = Dimensions.get('window').width;\nconst windowHeight = Dimensions.get('window').height;\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    padding: windowWidth * 0.05, // 5% padding\n  },\n  header: {\n    fontSize: windowWidth * 0.06, // Responsive font size\n    marginBottom: windowHeight * 0.02,\n  },\n  card: {\n    width: windowWidth > 600 ? '45%' : '90%', // Adapt to screen size\n    aspectRatio: 16 / 9,\n    margin: 10,\n    borderRadius: 10,\n    backgroundColor: '#fff',\n    shadowColor: '#000',\n    shadowOffset: { width: 0, height: 2 },\n    shadowOpacity: 0.25,\n    shadowRadius: 3.84,\n    elevation: 5,\n  }\n});"
        },
        {
          type: "text",
          title: "Accessibility in Mobile Apps",
          content: "Making mobile apps accessible is crucial. This includes supporting screen readers, providing adequate contrast, ensuring touch targets are large enough, and implementing proper navigation. Both iOS and Android provide accessibility tools and guidelines."
        }
      ]
    },
    {
      title: "Mobile App Testing",
      topic: "Mobile Development",
      duration: 40,
      content: [
        {
          type: "text",
          title: "Testing Strategies",
          content: "Mobile app testing involves unit testing, integration testing, UI testing, and end-to-end testing. It's important to test on real devices as well as simulators/emulators. Consider different screen sizes, OS versions, and network conditions."
        },
        {
          type: "code",
          title: "Unit Testing Example (Jest)",
          codeLanguage: "javascript",
          content: "import { calculateTotal, validateInput } from './utils';\n\ndescribe('Shopping Cart Utils', () => {\n  test('calculates total with tax', () => {\n    const items = [\n      { price: 10, quantity: 2 },\n      { price: 15, quantity: 1 }\n    ];\n    const taxRate = 0.1; // 10%\n    \n    expect(calculateTotal(items, taxRate)).toBe(38.5);\n  });\n\n  test('validates user input', () => {\n    expect(validateInput('')).toBe(false);\n    expect(validateInput('John')).toBe(true);\n    expect(validateInput(' ')).toBe(false);\n  });\n});"
        },
        {
          type: "text",
          title: "Performance Testing",
          content: "Performance testing for mobile apps includes measuring app launch time, memory usage, battery consumption, and network efficiency. Tools like Xcode Instruments for iOS and Android Profiler help identify and fix performance issues."
        }
      ]
    }
  ]
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log('Cleared existing courses and lessons');
    
    // Create courses and their associated lessons
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i];
      const course = new Course(courseData);
      await course.save();
      
      // Create lessons for this course
      const lessonTemplates = lessonsTemplate[i];
      if (lessonTemplates) {
        for (const lessonTemplate of lessonTemplates) {
          const lesson = new Lesson({
            ...lessonTemplate,
            courseId: course._id
          });
          await lesson.save();
          
          // Add lesson to course
          course.lessons.push(lesson._id);
        }
      }
      
      // Save updated course with lessons
      await course.save();
      console.log(`Created course: ${course.title} with ${course.lessons.length} lessons`);
    }
    
    // Add additional courses
    if (additionalCoursesData && additionalCoursesData.length > 0) {
      for (let i = 0; i < additionalCoursesData.length; i++) {
        const courseData = additionalCoursesData[i];
        const course = new Course(courseData);
        await course.save();
        
        // Create lessons for this course
        const lessonTemplates = additionalLessonsTemplate[i];
        if (lessonTemplates) {
          for (const lessonTemplate of lessonTemplates) {
            const lesson = new Lesson({
              ...lessonTemplate,
              courseId: course._id
            });
            await lesson.save();
            
            // Add lesson to course
            course.lessons.push(lesson._id);
          }
        }
        
        // Save updated course with lessons
        await course.save();
        console.log(`Created additional course: ${course.title} with ${course.lessons.length} lessons`);
      }
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase(); 