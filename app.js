const express = require('express');
const app = express();

app.use(express.json());
let users = [];

function isValidDateOfBirth(dob) {
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
    const parts = dob.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(d.getTime())) return false;
    // Compare only date (no time)
    const today = new Date();
    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dobNoTime = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dobNoTime < todayNoTime;
}

function isValidUsername(username) {
    // Allow letters, numbers and underscore
    return /^[a-zA-Z0-9_]+$/.test(username);
}

app.post('/users', (req, res) => {
    const { username, gender, dob } = req.body;

    if (!username || !isValidUsername(username)) {
        return res.status(400).json({ message: "Username không hợp lệ. Chỉ chấp nhận chữ, số và gạch dưới" });
    }

    if (users.some(u => u.username === username)) {
        return res.status(409).json({ message: "Username đã tồn tại." });
    }

    if (!dob || !isValidDateOfBirth(dob)) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ hoặc ở tương lai" });
    }

    const validGenders = ['male', 'female', 'other'];
    if (!gender || !validGenders.includes(String(gender).toLowerCase())) {
        return res.status(400).json({ message: "Giới tính không hợp lệ" });
    }

    const newUser = { id: users.length + 1, username, gender, dob };
    users.push(newUser);
    return res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });
});

module.exports = app;
