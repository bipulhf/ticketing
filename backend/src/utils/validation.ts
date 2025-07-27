import { ITDepartment, UserDepartment, Location } from "@prisma/client";
import { IT_DEPARTMENTS, USER_DEPARTMENTS, LOCATIONS } from "./constants";

/**
 * Validates IP address format (IPv4)
 * @param ip - IP address string to validate
 * @returns boolean indicating if IP is valid
 */
export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Validates if a department is valid for IT roles (Admin & IT Person)
 * @param department - Department to validate
 * @returns boolean indicating if department is valid
 */
export function isValidITDepartment(
  department: string
): department is ITDepartment {
  return Object.values(IT_DEPARTMENTS).includes(department as ITDepartment);
}

/**
 * Validates if a department is valid for normal users (display/filtering only)
 * @param department - Department to validate
 * @returns boolean indicating if department is valid
 */
export function isValidUserDepartment(
  department: string
): department is UserDepartment {
  return Object.values(USER_DEPARTMENTS).includes(department as UserDepartment);
}

/**
 * Validates if a location is valid
 * @param location - Location to validate
 * @returns boolean indicating if location is valid
 */
export function isValidLocation(location: string): location is Location {
  return Object.values(LOCATIONS).includes(location as Location);
}

/**
 * Validates if locations array is valid
 * @param locations - Array of locations to validate
 * @returns boolean indicating if all locations are valid
 */
export function isValidLocationsArray(
  locations: string[]
): locations is Location[] {
  return locations.every((location) => isValidLocation(location));
}

/**
 * Validates required fields for ticket creation
 * @param data - Ticket data to validate
 * @returns object with validation result and errors
 */
export function validateTicketRequiredFields(data: {
  ip_address: string;
  device_name: string;
  ip_number: string;
  department: string;
  location: string;
  user_department?: string | undefined;
}) {
  const errors: string[] = [];

  // Required fields validation
  if (!data.ip_address) {
    errors.push("IP address is required");
  } else if (!isValidIPAddress(data.ip_address)) {
    errors.push("Invalid IP address format");
  }

  if (!data.device_name) {
    errors.push("Device name is required");
  }

  if (!data.ip_number) {
    errors.push("IP number is required");
  }

  if (!data.department) {
    errors.push("Department is required");
  } else if (!isValidITDepartment(data.department)) {
    errors.push("Invalid department");
  }

  if (!data.location) {
    errors.push("Location is required");
  } else if (!isValidLocation(data.location)) {
    errors.push("Invalid location");
  }

  // Optional user department validation
  if (data.user_department && !isValidUserDepartment(data.user_department)) {
    errors.push("Invalid user department");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates user creation data based on role hierarchy
 * @param data - User creation data
 * @param creatorRole - Role of the user creating the account
 * @returns object with validation result and errors
 */
export function validateUserCreationData(
  data: {
    role: string;
    department?: string;
    locations?: string[];
    userLocation?: string;
  },
  creatorRole: string
) {
  const errors: string[] = [];

  // Validate department assignment based on role
  if (["super_admin", "admin", "it_person"].includes(data.role)) {
    if (!data.department) {
      errors.push("Department is required for this role");
    } else if (!isValidITDepartment(data.department)) {
      errors.push("Invalid department for this role");
    }
  }

  // Validate location assignment based on role
  if (data.role === "super_admin") {
    if (!data.locations || data.locations.length === 0) {
      errors.push("Multiple locations are required for Super Admin");
    } else if (!isValidLocationsArray(data.locations)) {
      errors.push("Invalid locations");
    }
  } else if (["admin", "it_person"].includes(data.role)) {
    // For IT persons, location will be automatically inherited from admin
    // For admins, location validation is still required
    if (data.role === "admin") {
      if (!data.userLocation) {
        errors.push("Single location is required for Admin");
      } else if (!isValidLocation(data.userLocation)) {
        errors.push("Invalid location");
      }
    }
    // IT persons don't need location validation as it's automatically inherited
  } else if (data.role === "user") {
    // Users don't need location validation as it's automatically inherited from IT Person
    // Location will be set automatically during inheritance
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
