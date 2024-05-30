# LMS project using MERN stack

## Backend (Server)

### Technology brief:

- Backend framwork: Expressjs
- Database: NoSQL - MongoDB
- ODM: Mongoose
- API: Cloudinary

### Modules:

#### Error Handler, JWT access/refresh token

- [x] Error handler
- [x] Authentication
- [x] Authorization
- [x] JWT refresh access token

#### User

- [x] User model design
- [x] Add user (User registration)
- [x] User login, logout
- [x] User authentication, authorization
- [x] Get user information
- [x] Update user information (name, email)
- [x] Update user password
- [x] Update user avatar and save it to cloudinary

#### Course

- [x] Course model design
- [x] Add course
- [x] Update course
- [x] Get one course without purchasing
- [x] Get all courses without purchasing
- [x] Get a course content - video on each course (for person who purchased)
- [x] Add question/answer for course video
- [x] Add review/review replies for course

#### Order

- [x] Order, notification model design
- [x] Create order
- [ ] Delete order

#### Notification

- [x] Delete notification auto after a certain time with node cron

#### Layout

- [x] Layout model: faq, category, hero banner
- [x] Get layout by type

#### Admin

- [x] Get all notifications
- [x] Update notification status
- [x] Get all users
- [x] Get all courses
- [x] Get all orders
- [x] Change user role
- [x] Delete user
- [x] Delete course
- [x] Get user analytics last 28 days
- [x] Get course analytics last 28 days
- [x] Create layout
- [x] Edit layout
