# Deployment Guide (The Safe Path)

Since you have a **paid plan** for Veg Wholesale, you can safely host this project on the **same Render account**. We will use **Supabase** for the database so your student data is never deleted.

## Step 1: Create a Permanent Database (Supabase)
1. Sign up/Login to **[Supabase](https://supabase.com)**.
2. Create a "New Project" named `internship-app-db`.
3. Go to **Project Settings > Database** and find your **Connection String**.
4. Copy the URL (it looks like `postgresql://postgres.[ID]:[PASSWORD]@...:5432/postgres`).
5. **NOTE**: You will need this for Step 3.

## Step 2: Push Code to GitHub
1. Create a new private repository on [GitHub](https://github.com/new).
2. In your local terminal, run:
   ```powershell
   git init
   git add .
   git commit -m "Deployment ready"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

## Step 3: Create Web Service on Render (Same Account)
1. Go to your **Render Dashboard**.
2. Click **New +** > **Web Service**.
3. Connect your new GitHub repository.
4. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. In the **Environment** tab, add:
   - `DATABASE_URL`: (Paste your Supabase Connection String here)
   - `NODE_ENV`: `production`

---

> [!IMPORTANT]
> Because you are using **Supabase**, your data is permanent. Because you have a **Paid Plan** on Render, your Veg Wholesale app remains 100% safe and will not be impacted.
