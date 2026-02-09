const API_URL = 'http://localhost:8080';

async function signup(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (response.status === 201) {
            messageDiv.textContent = 'Signup successful! Redirecting...';
            messageDiv.className = 'success';
            setTimeout(() => window.location.href = 'index.html', 2000);
        } else {
            messageDiv.textContent = data.message || 'Signup failed';
            messageDiv.className = 'error';
        }
    } catch (error) {
        messageDiv.textContent = 'Error connecting to server';
        messageDiv.className = 'error';
        console.error('Error:', error);
    }
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.status === 200) {
            messageDiv.textContent = `Welcome, ${data.name} (${data.role})!`;
            messageDiv.className = 'success';
            // Here you would redirect to a dashboard
        } else {
            messageDiv.textContent = data.message || 'Login failed';
            messageDiv.className = 'error';
        }
    } catch (error) {
        messageDiv.textContent = 'Error connecting to server';
        messageDiv.className = 'error';
        console.error('Error:', error);
    }
}
