const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let errors = [];

    if (firstname_input) {
        // Signup validation
        errors = getSignupFormErrors(
            firstname_input.value,
            email_input.value,
            password_input.value,
            repeat_password_input.value
        );
    } else {
        // Login validation
        errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if (errors.length > 0) {
        // Show error messages
        error_message.classList.remove('success');
        error_message.classList.add('error', 'show');
        error_message.innerText = errors.join(". ");
    } else {
        if (firstname_input) {
            // Signup: send data to server
            const userData = {
                firstname: firstname_input.value,
                email: email_input.value,
                password: password_input.value,
                repeatPassword: repeat_password_input.value
            };

            try {
                const response = await fetch("http://localhost:5000/api/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    error_message.classList.remove('error');
                    error_message.classList.add('success', 'show');
                    error_message.innerText = 'Account created successfully! Redirecting to login...';

                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    // Server returned an error
                    error_message.classList.remove('success');
                    error_message.classList.add('error', 'show');
                    error_message.innerText = data.message || 'Signup failed. Please try again.';
                }
            } catch (err) {
                console.error('Network Error:', err);
                error_message.classList.remove('success');
                error_message.classList.add('error', 'show');
                error_message.innerText = 'Network error. Please try again.';
            }

        } else {
            // Login: submit form normally
            form.submit();
        }
    }
});

function getSignupFormErrors(firstname, email, password, repeatPassword) {
    let errors = [];

    clearErrorStyles();

    if (!firstname) {
        errors.push('Firstname is required');
        firstname_input.parentElement.classList.add('incorrect');
    }
    if (!email) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    }
    if (!password) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }
    if (password && password.length < 8) {
        errors.push('Password must have at least 8 characters');
        password_input.parentElement.classList.add('incorrect');
    }
    if (password !== repeatPassword) {
        errors.push('Password does not match repeated password');
        password_input.parentElement.classList.add('incorrect');
        repeat_password_input.parentElement.classList.add('incorrect');
    }

    return errors;
}

function getLoginFormErrors(email, password) {{
    let errors = [];

    clearErrorStyles();

    if (!email) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    }
    if (!password) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }

    return errors;  
}
 window.location.href = "dashboard.html";
}

function clearErrorStyles() {
    const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null);
    allInputs.forEach(input => {
        input.parentElement.classList.remove('incorrect');
    });
}

const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            error_message.classList.remove('show', 'error', 'success');
            error_message.innerText = '';
        }
    });
});
