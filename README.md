<!--
# Virtual Study Mugen

## Introduction
Virtual Study Mugen is a collaborative study platform where students can chat with peers, form study groups, and engage in interactive learning sessions. The platform features a role-based system that distinguishes between admin and student users, ensuring a secure and organized environment for all participants.

## Tech Stack
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: A NoSQL database for flexible data storage.
- **Node.js**: JavaScript runtime built on Chrome's V8 engine.
- **React.js**: A JavaScript library for building user interfaces.
- **JWT**: JSON Web Tokens for secure authentication.
- **Nodemailer**: Module for sending emails.
- **Socket.io**: Library for real-time communication.
- **OpenAI Integration**: Provides AI-powered features.

## Features
- **RESTful API**: Well-structured API endpoints for seamless integration.
- **Role Based Login**: Secure login system with distinct roles for admin and student.
- **Responsive Design**: Optimized for a range of devices and screen sizes.

## Setup

### Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Somepalli-Venkatesh/vsm.git
2. **Install dependencies:**
   ```bash
   npm install
3. **Start the frontend:**
   ```bash
   cd vsm/frontend
   npm install
   npm run dev
4. **Start the backend:**
   ```bash
   cd vsm/backend
   npm install
   npm start
## Workflow

Below are some screenshots demonstrating the workflow of Virtual Study Mugen:

1. **Login Screen:**
   ![Login Screen](./screenshots/login.png)

2. **Dashboard:**
   ![Dashboard](./screenshots/dashboard.png)

3. **Chat Interface:**
   ![Chat Interface](./screenshots/chat.png)

4. **Group Creation:**
   ![Group Creation](./screenshots/group.png)

5. **Admin Panel:**
   ![Admin Panel](./screenshots/admin.png)

6. **User Profile:**
   ![User Profile](./screenshots/profile.png)

7. **Study Session:**
   ![Study Session](./screenshots/study.png)

8. **Real-time Notifications:**
   ![Notifications](./screenshots/notifications.png)

9. **Settings:**
   ![Settings](./screenshots/settings.png)

10. **Responsive Design:**
    ![Responsive Design](./screenshots/responsive.png)
## Live Demo
Check out the live demo [here](https://dummyurl.com).

 -->

 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Virtual Study Mugen</title>
  <style>
    body {
      background-color: #0B0014;
      color: #C87CFF;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 30px;
      margin: 0;
    }
    h1, h2 {
      margin-bottom: 20px;
    }
    p {
      line-height: 1.6;
    }
    code {
      background-color: #1f0126;
      padding: 3px 5px;
      border-radius: 5px;
    }
    a {
      color: #C87CFF;
      text-decoration: none;
    }
    /* Container for sections that need a max-width */
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    /* Workflow grid styling */
    .workflow-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }
    .workflow-item {
      flex: 1 1 45%;
      background-color: #1f0126;
      border-radius: 10px;
      box-shadow: 0 0 10px #E58CFF;
      padding: 10px;
    }
    .workflow-item img {
      width: 100%;
      border-radius: 10px;
    }
    .icon-item {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    .icon-item img {
      width: 40px;
      margin-right: 10px;
    }
    /* Contact icons styling */
    .contact-icons img {
      width: 40px;
      margin: 0 10px;
    }
  </style>
</head>
<body>

  <!-- Introduction -->
  <div class="container" style="text-align: center;">
    <!-- Replace YOUR_IMAGE_URL with your actual image link -->
    <img src="YOUR_IMAGE_URL" alt="VSM Logo" style="width:200px; border-radius:10px; box-shadow: 0 0 10px #E58CFF;">
    <h2 style="margin-top:20px;">Hi, I am VSM</h2>
    <h1>Virtual Study Mugen</h1>
    <p>
      Virtual Study Mugen is a collaborative study platform where students can chat with peers, form study groups, 
      and engage in interactive learning sessions. The platform features a role-based system that distinguishes between 
      admin and student users, ensuring a secure and organized environment for all participants.
    </p>
  </div>

  <!-- Tech Stack -->
  <div class="container">
    <h2 style="color:#E58CFF;">Tech Stack</h2>
    <p>Below are the technologies used in this project. Each tech stack item is displayed with an icon and a brief description:</p>
    
    <!-- Express -->
    <div class="icon-item">
      <img src="EXPRESS_ICON_URL" alt="Express Icon">
      <div>
        <strong style="color:#E58CFF;">Express</strong>
        <p>A fast, unopinionated, minimalist web framework for Node.js.</p>
      </div>
    </div>
    <!-- MongoDB -->
    <div class="icon-item">
      <img src="MONGODB_ICON_URL" alt="MongoDB Icon">
      <div>
        <strong style="color:#E58CFF;">MongoDB</strong>
        <p>A NoSQL database for flexible data storage.</p>
      </div>
    </div>
    <!-- Node.js -->
    <div class="icon-item">
      <img src="NODE_ICON_URL" alt="Node.js Icon">
      <div>
        <strong style="color:#E58CFF;">Node.js</strong>
        <p>JavaScript runtime built on Chrome's V8 engine.</p>
      </div>
    </div>
    <!-- React.js -->
    <div class="icon-item">
      <img src="REACT_ICON_URL" alt="React Icon">
      <div>
        <strong style="color:#E58CFF;">React.js</strong>
        <p>A JavaScript library for building user interfaces.</p>
      </div>
    </div>
    <!-- JWT -->
    <div class="icon-item">
      <img src="JWT_ICON_URL" alt="JWT Icon">
      <div>
        <strong style="color:#E58CFF;">JWT</strong>
        <p>JSON Web Tokens for secure authentication.</p>
      </div>
    </div>
    <!-- Nodemailer -->
    <div class="icon-item">
      <img src="NODEMAILER_ICON_URL" alt="Nodemailer Icon">
      <div>
        <strong style="color:#E58CFF;">Nodemailer</strong>
        <p>A module for sending emails from Node.js applications.</p>
      </div>
    </div>
    <!-- Socket.io -->
    <div class="icon-item">
      <img src="SOCKET_IO_ICON_URL" alt="Socket.io Icon">
      <div>
        <strong style="color:#E58CFF;">Socket.io</strong>
        <p>A library for real-time, bidirectional event-based communication.</p>
      </div>
    </div>
    <!-- OpenAI Integration -->
    <div class="icon-item">
      <img src="OPENAI_ICON_URL" alt="OpenAI Icon">
      <div>
        <strong style="color:#E58CFF;">OpenAI Integration</strong>
        <p>Provides AI-powered features and enhancements.</p>
      </div>
    </div>
  </div>

  <!-- Features -->
  <div class="container">
    <h2 style="color:#E58CFF;">Features</h2>
    <ul style="list-style:none; padding-left:0;">
      <li>⚡ <strong>RESTful API</strong> — Well-structured endpoints for seamless integration</li>
      <li>🔐 <strong>Role Based Login</strong> — Secure login system with distinct roles for admin and student</li>
      <li>📱 <strong>Responsive Design</strong> — Optimized for a range of devices and screen sizes</li>
      <li>💬 <strong>Real-time Chat</strong> — Connect and collaborate instantly</li>
      <li>👥 <strong>Group Creation</strong> — Form study groups effortlessly</li>
      <li>🛠 <strong>Admin Panel</strong> — Manage users and content efficiently</li>
    </ul>
  </div>

  <!-- Setup & Installation -->
  <div class="container">
    <h2 style="color:#E58CFF;">Setup & Installation</h2>
    <ol>
      <li>
        <strong>Clone the repository:</strong><br>
        <code>git clone https://github.com/Somepalli-Venkatesh/vsm.git</code>
      </li>
      <li>
        <strong>Install dependencies:</strong><br>
        <code>npm install</code>
      </li>
      <li>
        <strong>Start the frontend:</strong><br>
        <code>
          cd vsm/frontend<br>
          npm install<br>
          npm run dev
        </code>
      </li>
      <li>
        <strong>Start the backend:</strong><br>
        <code>
          cd vsm/backend<br>
          npm install<br>
          npm start
        </code>
      </li>
    </ol>
  </div>

  <!-- Workflow -->
  <div class="container">
    <h2 style="color:#E58CFF;">Workflow</h2>
    <div class="workflow-grid">
      <!-- 20 workflow images (10 rows of 2 images each) -->
      <!-- Row 1 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow1.png" alt="Workflow 1">
        <p style="text-align:center; margin-top:10px;">Workflow Step 1</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow2.png" alt="Workflow 2">
        <p style="text-align:center; margin-top:10px;">Workflow Step 2</p>
      </div>
      <!-- Row 2 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow3.png" alt="Workflow 3">
        <p style="text-align:center; margin-top:10px;">Workflow Step 3</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow4.png" alt="Workflow 4">
        <p style="text-align:center; margin-top:10px;">Workflow Step 4</p>
      </div>
      <!-- Row 3 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow5.png" alt="Workflow 5">
        <p style="text-align:center; margin-top:10px;">Workflow Step 5</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow6.png" alt="Workflow 6">
        <p style="text-align:center; margin-top:10px;">Workflow Step 6</p>
      </div>
      <!-- Row 4 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow7.png" alt="Workflow 7">
        <p style="text-align:center; margin-top:10px;">Workflow Step 7</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow8.png" alt="Workflow 8">
        <p style="text-align:center; margin-top:10px;">Workflow Step 8</p>
      </div>
      <!-- Row 5 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow9.png" alt="Workflow 9">
        <p style="text-align:center; margin-top:10px;">Workflow Step 9</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow10.png" alt="Workflow 10">
        <p style="text-align:center; margin-top:10px;">Workflow Step 10</p>
      </div>
      <!-- Row 6 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow11.png" alt="Workflow 11">
        <p style="text-align:center; margin-top:10px;">Workflow Step 11</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow12.png" alt="Workflow 12">
        <p style="text-align:center; margin-top:10px;">Workflow Step 12</p>
      </div>
      <!-- Row 7 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow13.png" alt="Workflow 13">
        <p style="text-align:center; margin-top:10px;">Workflow Step 13</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow14.png" alt="Workflow 14">
        <p style="text-align:center; margin-top:10px;">Workflow Step 14</p>
      </div>
      <!-- Row 8 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow15.png" alt="Workflow 15">
        <p style="text-align:center; margin-top:10px;">Workflow Step 15</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow16.png" alt="Workflow 16">
        <p style="text-align:center; margin-top:10px;">Workflow Step 16</p>
      </div>
      <!-- Row 9 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow17.png" alt="Workflow 17">
        <p style="text-align:center; margin-top:10px;">Workflow Step 17</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow18.png" alt="Workflow 18">
        <p style="text-align:center; margin-top:10px;">Workflow Step 18</p>
      </div>
      <!-- Row 10 -->
      <div class="workflow-item">
        <img src="./screenshots/workflow19.png" alt="Workflow 19">
        <p style="text-align:center; margin-top:10px;">Workflow Step 19</p>
      </div>
      <div class="workflow-item">
        <img src="./screenshots/workflow20.png" alt="Workflow 20">
        <p style="text-align:center; margin-top:10px;">Workflow Step 20</p>
      </div>
    </div>
  </div>

  <!-- Live Demo -->
  <div class="container" style="text-align: center;">
    <h2 style="color:#E58CFF;">Live Demo</h2>
    <!-- Replace the href and image src with your demo link and image -->
    <a href="https://dummyurl.com" target="_blank">
      <img src="./screenshots/demo.png" alt="Live Demo" style="width:200px; border-radius:10px; box-shadow:0 0 10px #E58CFF;">
    </a>
    <p style="margin-top:10px;">Click the image to view the live demo</p>
  </div>

  <!-- Contact -->
  <div class="container" style="text-align: center;">
    <h2 style="color:#E58CFF;">Contact</h2>
    <div class="contact-icons">
      <!-- Replace the links and image sources with your actual social media URLs and icon images -->
      <a href="https://instagram.com" target="_blank">
        <img src="./screenshots/instagram_icon.png" alt="Instagram">
      </a>
      <a href="https://linkedin.com" target="_blank">
        <img src="./screenshots/linkedin_icon.png" alt="LinkedIn">
      </a>
      <a href="https://github.com" target="_blank">
        <img src="./screenshots/github_icon.png" alt="GitHub">
      </a>
    </div>
  </div>

</body>
</html>
