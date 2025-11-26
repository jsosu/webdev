const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

// VERY SIMPLE localStorage Database
const SimpleDB = {
    // Get all users from localStorage
    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },

    // Add a new user
    addUser(user) {
        const users = this.getUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === user.email)) {
            throw new Error('User already exists');
        }
        
        users.push(user);
        this.saveUsers(users);
        return user;
    },

    // Find user by email
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email) || null;
    },

    // Check if user exists
    userExists(email) {
        return this.getUserByEmail(email) !== null;
    }
};

// Remove all the complex IndexedDB code and replace the form submit handler:

form.addEventListener('submit', (e) => {
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
            // SIGNUP - Simple version
            try {
                if (SimpleDB.userExists(email_input.value)) {
                    error_message.classList.remove('success');
                    error_message.classList.add('error', 'show');
                    error_message.innerText = 'User with this email already exists.';
                    email_input.parentElement.classList.add('incorrect');
                    return;
                }

                // Create new user
                const user = {
                    firstname: firstname_input.value,
                    email: email_input.value,
                    password: password_input.value,
                    createdAt: new Date().toISOString()
                };

                SimpleDB.addUser(user);
                
                // Show success message and redirect
                error_message.classList.remove('error');
                error_message.classList.add('success', 'show');
                error_message.innerText = 'Account created successfully! Redirecting to login...';

                // Clear form
                form.reset();

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                console.error('Signup error:', error);
                error_message.classList.remove('success');
                error_message.classList.add('error', 'show');
                error_message.innerText = 'Failed to create account. Please try again.';
            }
        } else {
            // LOGIN - Simple version
            const user = SimpleDB.getUserByEmail(email_input.value);
            
            if (!user) {
                error_message.classList.remove('success');
                error_message.classList.add('error', 'show');
                error_message.innerText = 'No account found with this email.';
                email_input.parentElement.classList.add('incorrect');
                return;
            }

            if (user.password !== password_input.value) {
                error_message.classList.remove('success');
                error_message.classList.add('error', 'show');
                error_message.innerText = 'Invalid password.';
                password_input.parentElement.classList.add('incorrect');
                return;
            }

            // Login successful - store user session
            localStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                firstname: user.firstname,
                loggedIn: true
            }));

            // Show success message
            error_message.classList.remove('error');
            error_message.classList.add('success', 'show');
            error_message.innerText = 'Login successful! Redirecting...';

            // Redirect to dashboard or home page
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    }
});

// Keep all your existing validation functions (they work perfectly):
function getSignupFormErrors(firstname, email, password, repeatPassword) {
    let errors = [];
    clearErrorStyles();

    if (!firstname) {
        errors.push('Firstname is required');
        firstname_input.parentElement.classList.add('incorrect');
    } else if (firstname.length < 2) {
        errors.push('Firstname must be at least 2 characters long');
        firstname_input.parentElement.classList.add('incorrect');
    }

    if (!email) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    } else if (!isValidEmail(email)) {
        errors.push('Please enter a valid email address');
        email_input.parentElement.classList.add('incorrect');
    }

    if (!password) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    } else if (password.length < 8) {
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

function getLoginFormErrors(email, password) {
    let errors = [];
    clearErrorStyles();

    if (!email) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    } else if (!isValidEmail(email)) {
        errors.push('Please enter a valid email address');
        email_input.parentElement.classList.add('incorrect');
    }

    if (!password) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }

    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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