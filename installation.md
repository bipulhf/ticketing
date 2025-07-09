### Setup Instructions

1. **Download and Install Docker**
   Install Docker from the official site: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. **Navigate to the Project Directory**
   Open your terminal and change to the root directory of the project.

3. **Start the Application**
   Run the following command to build and start the services:

   ```bash
   docker compose up --build -d
   ```

4. **Access the Application**
   Once the services are up, the system will be available at:
   [http://localhost:80](http://localhost:80)

5. **Default System Owner Account**
   A System Owner account will be created automatically with the following credentials:

   - **Username:** `system_owner`
   - **Password:** `defaultPassword123!`

6. **User Account Policy**

   - Each user must register with a **unique username**.
   - The default password for all new users is: `defaultPassword123!`
   - Users are encouraged to change their password after logging in.
