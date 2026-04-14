import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: "test user",
        email: "test_new1@example.com",
        password: "password123",
        role: "Student",
        roomNumber: "A101",
        block: "A",
        hostelName: "Hostel 1",
        phone: "1234567890"
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error Response Data:", err.response.data);
      console.log("Error Response Status:", err.response.status);
    } else {
      console.log("Error:", err.message);
    }
  }
}
test();
