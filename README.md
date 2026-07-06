# Nexoraa — Premium SaaS Onboarding & Auth Page

A premium, production-grade **Login / Sign-up onboarding experience** inspired by modern SaaS platforms (like Stripe, Vercel, and Linear). Built with **React**, **Vite**, and **Tailwind CSS v4** featuring responsive split-screen visuals, multi-step validation flows, custom password strength metrics, interactive OTP input boxes, dialog-based forms, and light/dark theme toggles.

---

## ⚡ Quick Start (How to Run)

To run the application locally on your machine, run the following commands in your terminal:

### 1. Install Dependencies
If you have just cloned the repository, install the project dependencies:
```bash
npm install
```

### 2. Start Development Server
Spin up the local dev server:
```bash
npm run dev
```

### 3. Open in Browser
Once running, open the URL printed in your terminal (usually [http://localhost:5173/](http://localhost:5173/)) to view the page.

### 4. Build for Production
To bundle the assets into optimized static files for hosting (saved in the `dist/` directory):
```bash
npm run build
```

---

## 🎯 How to Use & Test (Interactive Demo Guide)

This authentication flow is fully operational client-side (using mocked async timeouts to simulate server calls). Follow these steps to demo all features during your presentation:

### Step 1: Input & Email Validation
1. **Try Empty Submission**: Click the **Continue** button immediately without entering anything. An inline warning `Email is required` will appear.
2. **Try Invalid Formats**: Type `username` (without `@` or `.com`) and click **Continue** (or click out of the box). An inline warning `Please enter a valid email address` will appear.
3. **Switch to Sign up Mode**: Click the **Sign up** link in the footer. Notice that the title shifts and a **Full Name** field is added above the email. Try submitting it empty to see name validation in action.
4. **Proceed successfully**: Type a valid email (e.g., `developer@nexoraa.com`) and click **Continue**. The card will transition to Step 2.

---

### Step 2: Choose Authentication Method
Step 2 offers three tabs at the top of the form, each with custom auth handlers:

#### 🔒 Tab 1: Password Auth
* **Password Strength Meter (Sign-up Mode)**: Start typing a password. You will see a dynamic, color-coded strength bar transition:
  * **Weak (Red)**: Under 8 characters.
  * **Medium (Amber)**: 8+ characters with basic letters.
  * **Strong (Green)**: 8+ characters containing uppercase, lowercase, numbers, and special characters.
* **Forgot Password flow (Login Mode)**:
  1. Click **Forgot password?** below the inputs.
  2. The native dialog modal will slide and scale open with a background blur.
  3. Enter your email and click **Send Reset Link** to trigger a simulated sending loader. A success notification toast will pop up in the bottom-right corner.
  4. *Light Dismiss*: Dismiss the modal by pressing the `Esc` key or simply clicking anywhere outside the modal box on the dark background.

#### 🔑 Tab 2: OTP Code (One-Time Password)
1. Click **Send Verification Code**.
2. A spinner appears for 1.2 seconds, simulating an SMS/Email dispatch.
3. Once sent, a 60-second countdown timer starts, and **6 individual digit boxes** appear.
4. **Auto-focus navigation**: Type digits `1` through `6`. Focus automatically hops forward as you type. If you hit `Backspace`, it deletes and shifts focus backward.
5. **Paste capability**: Copy the code `123456` or `111111` to your clipboard, click the first input box, and press paste (`Ctrl+V` or `Cmd+V`). All 6 boxes will populate instantly.
6. Click **Verify & Continue** (demo valid codes: `123456` or `111111`). You will receive a success toast, and the app resets to Step 1.

#### 🌐 Tab 3: Social Login
1. Click any social button: **Google**, **GitHub**, or **Apple**.
2. The clicked button shows a loading spinner, and the other buttons automatically disable to prevent concurrent clicks.
3. After 2 seconds, a success toast pops up confirming successful login.

---

### 🎨 Theme Toggle (Dark & Light Mode)
Click the **Sun/Moon icon** in the top-right corner of the authentication form card. The visual tokens transition:
* **Light Mode**: Clean slate typography, semi-transparent white glassmorphic panels, and subtle gray borders.
* **Dark Mode**: Matte black panels, glowing indigo/violet aurora elements, neon outlines, and high-contrast white typography.

---

## 🏗️ Architecture & Component Code

The code is fully componentized and clean for easy review during your presentation:
* **`src/App.jsx`**: Manages state machines (theme, step layout, signup vs. login, error triggers, form shaking).
* **`src/components/BrandPanel.jsx`**: Renders the left graphic side displaying product titles and a simulated terminal compiling files and edge responses in real-time.
* **`src/components/InputField.jsx`**: An outlined, accessible wrapper tracking active focus, validation alerts, and password eye toggles.
* **`src/components/OTPInput.jsx`**: Handles focus loops, backspaces, and clipboard paste arrays.
* **`src/components/ForgotPasswordModal.jsx`**: Native `<dialog>` modal executing discrete entry/exit animations via `@starting-style` and `transition-behavior: allow-discrete`.
* **`src/components/SocialButton.jsx`**: Embeds inline official Google, GitHub, and Apple SVG vectors.
* **`src/components/Toast.jsx`**: Manages dynamic toast alert contexts.
