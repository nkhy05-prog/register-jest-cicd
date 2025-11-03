const request = require('supertest');
const app = require('./app'); // Import Express app từ app.js

// Lấy ngày hiện tại và ngày trong tương lai
const today = new Date().toISOString().slice(0, 10);
const futureDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);

describe('POST /users - User Creation API', () => {

    // Test Case 1: Tạo tài khoản với username chứa kí tự đặc biệt
    test('Nên trả về 400 nếu username chứa ký tự đặc biệt', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: 'user@name!', // Ký tự đặc biệt
                gender: 'male',
                dob: '1990-01-01'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Username không hợp lệ/);
    });

    // Test Case 2: Tạo tài khoản có ngày sinh ở tương lai
    test('Nên trả về 400 nếu ngày sinh ở tương lai', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: 'futureuser',
                gender: 'female',
                dob: futureDate // Ngày sinh ở tương lai
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Ngày sinh không hợp lệ hoặc ở tương lai/);
    });

    // Test Case 3: Tạo tài khoản thỏa mãn tất cả điều kiện
    test('Nên tạo tài khoản thành công với status 201', async () => {
        const validUser = {
            username: 'valid_user_123', // Hợp lệ: chữ, số, gạch dưới
            gender: 'male', // Hợp lệ
            dob: '1995-10-25' // Hợp lệ: không ở tương lai
        };

        const response = await request(app)
            .post('/users')
            .send(validUser);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Tạo người dùng thành công");
        expect(response.body.user).toMatchObject({
            username: validUser.username,
            gender: validUser.gender
        });

        // Test thêm: Kiểm tra username đã tồn tại (một test case bổ sung quan trọng)
        const conflictResponse = await request(app)
            .post('/users')
            .send(validUser);
        
        expect(conflictResponse.statusCode).toBe(409);
        expect(conflictResponse.body.message).toBe("Username đã tồn tại.");
    });
    
    // Test Case Bổ Sung: Giới tính không hợp lệ
    test('Nên trả về 400 nếu giới tính không hợp lệ', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                username: 'genderuser',
                gender: 'invalid_gender', // Giới tính không hợp lệ
                dob: '1990-01-01'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Giới tính không hợp lệ/);
    });

});