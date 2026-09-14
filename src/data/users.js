/**
 * Mock portal-user source for the Control Panel.
 * Swap the exported getters/mutators for API calls when the backend is ready —
 * the shape returned here is what the view expects.
 */

import { reactive } from "vue";

/** Roles a portal user can hold. `admin` always sees every business. */
export const ROLES = ["admin", "CMI", "user"];

/** Roles whose access limit is fixed to every business. */
export const FULL_ACCESS_ROLES = ["admin"];

export const hasFullAccess = (role) => FULL_ACCESS_ROLES.includes(role);

/* access: array of business slugs; ignored for full-access roles */
const USERS = reactive([
  {
    id: 1,
    name: "ACI CB Admin",
    userId: "admin123",
    password: "admin123",
    role: "admin",
    access: [],
  },
  {
    id: 2,
    name: "ACI CB CMI",
    userId: "Hygiene1",
    password: "Rahul123",
    role: "CMI",
    access: ["hygiene", "paints"],
  },
  {
    id: 3,
    name: "ACI CB Hygiene",
    userId: "userHygiene",
    password: "userHygiene",
    role: "user",
    access: ["hygiene"],
  },
]);

/** Every portal user, newest first. */
export const getUsers = () => [...USERS].reverse();

export const getUser = (id) =>
  USERS.find((u) => String(u.id) === String(id)) || null;

/** True when another user already holds this login id. */
const userIdTaken = (userId, exceptId = null) =>
  USERS.some(
    (u) =>
      u.userId.toLowerCase() === userId.trim().toLowerCase() &&
      String(u.id) !== String(exceptId)
  );

/**
 * Adds a portal user.
 * Swap for a POST once the backend is ready; returns null on a duplicate User ID.
 */
export const addUser = ({ name, userId, password, role, access = [] }) => {
  if (userIdTaken(userId)) return null;

  const nextId = USERS.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const user = {
    id: nextId,
    name: name.trim(),
    userId: userId.trim(),
    password,
    role,
    access: hasFullAccess(role) ? [] : [...access],
  };

  USERS.push(user);
  return user;
};

/**
 * Applies edited fields to a user in place.
 * Returns null when the id is unknown or the User ID belongs to someone else.
 */
export const updateUser = (id, patch) => {
  const user = getUser(id);
  if (!user) return null;
  if (patch.userId && userIdTaken(patch.userId, id)) return null;

  Object.assign(user, patch, {
    name: (patch.name ?? user.name).trim(),
    userId: (patch.userId ?? user.userId).trim(),
    access: hasFullAccess(patch.role ?? user.role)
      ? []
      : [...(patch.access ?? user.access)],
  });

  return user;
};

/** Removes a user. Returns false when the id is unknown. */
export const removeUser = (id) => {
  const index = USERS.findIndex((u) => String(u.id) === String(id));
  if (index === -1) return false;

  USERS.splice(index, 1);
  return true;
};
