import User from "../models/User.js";
import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Lista utenti con statistiche ordini (count + totale speso).
// Visibile solo agli admin.
export const getUsersWithStats = asyncHandler(async (_req, res) => {
  const users = await User.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "orders",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        avatar: 1,
        authProvider: 1,
        createdAt: 1,
        ordersCount: { $size: "$orders" },
        totalSpent: {
          $round: [{ $sum: "$orders.totalAmount" }, 2],
        },
        lastOrderAt: { $max: "$orders.createdAt" },
      },
    },
    { $sort: { totalSpent: -1, createdAt: -1 } },
  ]);

  res.json(users);
});

// Elimina il proprio account. Gli admin non possono eliminarsi da qui
// (eviti di rimuovere l'unico super admin per sbaglio).
export const deleteOwnAccount = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role === "admin") {
    return res.status(403).json({
      message: "Admin accounts cannot be deleted from the public profile",
    });
  }

  // GDPR-friendly: rimuovi anche la cronologia ordini dell'utente.
  await Order.deleteMany({ user: req.user._id });
  await User.deleteOne({ _id: req.user._id });

  res.json({ message: "Account deleted successfully" });
});
