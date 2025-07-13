### Setup Instructions (For Server Deployment using Docker CLI)

1. **Install Docker and Docker Compose**

   Make sure Docker and Docker Compose are installed on your server.

   **Install Docker:**

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

   **Install Docker Compose (if not included):**

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd /path/to/your/project
   ```

3. **Update `UPLOADTHING_CALLBACK_URL`**

   Open the `docker-compose.yml` file and **update the `UPLOADTHING_CALLBACK_URL`** environment variable with your actual domain name or IP.

   Example:

   ```yaml
   environment:
     UPLOADTHING_CALLBACK_URL: "https://yourdomain.com"
   ```

4. **Build and Start the Application**

   Use Docker Compose to build and run the application in detached mode:

   ```bash
   sudo docker compose up --build -d
   ```

5. **Access the Application**

   Once the services are up and running, you can access the system via:

   - **URL:** [http://your-server-ip-or-domain](http://your-server-ip-or-domain)

6. **Default System Owner Account**

   A default **System Owner** account will be created automatically:

   - **Username:** `system_owner`
   - **Password:** `defaultPassword123!`

7. **User Account Policy**

   - Each user must register with a **unique username**.
   - The default password for all new users is: `defaultPassword123!`
   - All users are strongly encouraged to **change their password** after first login.
