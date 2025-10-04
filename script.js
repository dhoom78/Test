// Hotel Booking System JavaScript
class HotelBookingSystem {
    constructor() {
        this.currentUser = null;
        this.currentStep = 1;
        this.currentLanguage = 'en';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.validationMessages = {};
        this.bookingData = {
            hotel: null,
            roomType: null,
            checkInDate: null,
            checkOutDate: null,
            activities: [],
            name: '',
            phone: '',
            email: '',
            notes: ''
        };
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        
        this.hotelData = {
            'burj-al-arab': { name: 'Burj Al Arab', basePrice: 800, location: 'Dubai, UAE' },
            'ritz-paris': { name: 'The Ritz Paris', basePrice: 600, location: 'Paris, France' },
            'marina-bay': { name: 'Marina Bay Sands', basePrice: 400, location: 'Singapore' },
            'four-seasons': { name: 'Four Seasons Resort', basePrice: 1200, location: 'Maldives' },
            'palace-istanbul': { name: 'Palace Istanbul', basePrice: 450, location: 'Istanbul, Turkey' },
            'aman-tokyo': { name: 'Aman Tokyo', basePrice: 900, location: 'Tokyo, Japan' },
            'belmond-copacabana': { name: 'Belmond Copacabana Palace', basePrice: 550, location: 'Rio de Janeiro, Brazil' }
        };
        
        this.roomTypes = {
            'standard': { name: 'Standard Room', price: 0 },
            'deluxe': { name: 'Deluxe Room', price: 100 },
            'suite': { name: 'Luxury Suite', price: 300 }
        };
        
        this.activities = {
            'spa': { name: 'Luxury Spa Package', price: 150 },
            'dining': { name: 'Fine Dining Experience', price: 80 },
            'fitness': { name: 'Personal Training Session', price: 25 },
            'entertainment': { name: 'VIP Entertainment Access', price: 50 }
        };
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.applyTheme();
            this.applyLanguage();
            this.updateValidationMessages();
            this.loadUserBookings();
            this.checkAuthState();
            this.initializeAccessibility();
        } catch (error) {
            console.error('Error initializing HotelBookingSystem:', error);
            this.showNotification('System initialization failed. Please refresh the page.', 'error');
        }
    }

    initializeAccessibility() {
        // Set initial aria-pressed states
        const themeToggle = document.getElementById('themeToggle');
        const languageToggle = document.getElementById('languageToggle');
        
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', this.currentTheme === 'dark');
        }
        
        if (languageToggle) {
            languageToggle.setAttribute('aria-pressed', this.currentLanguage === 'ar');
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('signInBtn').addEventListener('click', () => this.showAuthModal('signin'));
        document.getElementById('signUpBtn').addEventListener('click', () => this.showAuthModal('signup'));
        document.getElementById('startBookingBtn').addEventListener('click', () => this.showBookingModal());
        document.getElementById('exploreActivitiesBtn').addEventListener('click', () => this.scrollToSection('activities'));
        
        // Theme and Language Toggles
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('languageToggle').addEventListener('click', () => this.toggleLanguage());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal('authModal'));
        document.getElementById('closeBookingModal').addEventListener('click', () => this.hideModal('bookingModal'));
        document.getElementById('closeDashboardModal').addEventListener('click', () => this.hideModal('dashboardModal'));
        
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('switchMode').addEventListener('click', () => this.switchAuthMode());
        
        // Real-time form validation
        document.getElementById('email').addEventListener('blur', (e) => this.validateEmailField(e.target));
        document.getElementById('password').addEventListener('blur', (e) => this.validatePasswordField(e.target));
        document.getElementById('confirmPassword').addEventListener('blur', (e) => this.validateConfirmPasswordField(e.target));
        document.getElementById('fullName').addEventListener('blur', (e) => this.validateNameField(e.target));
        
        // Booking form
        document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleBookingSubmit(e));
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep').addEventListener('click', () => this.prevStep());
        
        // Hotel selection
        document.querySelectorAll('.hotel-option').forEach(option => {
            option.addEventListener('click', () => this.selectHotel(option));
        });
        
        // Room selection
        document.querySelectorAll('.room-option').forEach(option => {
            option.addEventListener('click', () => this.selectRoom(option));
        });
        
        // Date selection
        document.getElementById('checkInDate').addEventListener('change', () => this.onDateChange());
        document.getElementById('checkOutDate').addEventListener('change', () => this.onDateChange());
        
        // Time slot selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot')) {
                this.selectTimeSlot(e.target);
            }
        });
        
        // Dashboard tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Profile management
        document.getElementById('profileForm').addEventListener('submit', (e) => this.handleProfileUpdate(e));
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.showChangePasswordModal());
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.deleteAccount());
        
        // Hotel cards
        document.querySelectorAll('.hotel-card').forEach(card => {
            card.addEventListener('click', () => {
                const hotel = card.dataset.hotel;
                this.selectHotelFromCard(hotel);
            });
        });
        
        // Activity cards
        document.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('click', () => {
                const activity = card.dataset.activity;
                this.selectActivityFromCard(activity);
            });
        });
        
        // Mobile menu
        document.getElementById('hamburger').addEventListener('click', () => this.toggleMobileMenu());
        
        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Theme and Language Methods
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        
        // Update aria-pressed for accessibility
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', this.currentTheme === 'dark');
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (this.currentTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.applyLanguage();
        
        // Update aria-pressed for accessibility
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.setAttribute('aria-pressed', this.currentLanguage === 'ar');
        }
    }

    applyLanguage() {
        document.documentElement.setAttribute('dir', this.currentLanguage === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLanguage);
        
        // Update all elements with data attributes
        document.querySelectorAll('[data-en][data-ar]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });
        
        // Update language toggle button
        const langSpan = document.querySelector('#languageToggle span');
        langSpan.textContent = this.currentLanguage === 'en' ? 'عربي' : 'EN';
        
        // Update placeholder texts for Arabic
        if (this.currentLanguage === 'ar') {
            this.updateArabicPlaceholders();
        }
        
        // Update form validation messages
        this.updateValidationMessages();
    }

    updateArabicPlaceholders() {
        const placeholders = {
            'email': 'example@email.com',
            'password': '••••••••',
            'confirmPassword': '••••••••',
            'fullName': 'الاسم الكامل',
            'bookingName': 'الاسم الكامل',
            'bookingPhone': 'رقم الهاتف',
            'bookingEmail': 'البريد الإلكتروني',
            'bookingNotes': 'طلبات خاصة (اختياري)',
            'profileFullName': 'الاسم الكامل',
            'profilePhone': 'رقم الهاتف',
            'profileEmailField': 'البريد الإلكتروني',
            'profileBio': 'أخبرنا عن نفسك...'
        };
        
        Object.entries(placeholders).forEach(([id, placeholder]) => {
            const element = document.getElementById(id);
            if (element) {
                if (this.currentLanguage === 'ar' && id === 'fullName') {
                    element.placeholder = placeholder;
                } else if (this.currentLanguage === 'en') {
                    element.placeholder = placeholder;
                }
            }
        });
    }

    updateValidationMessages() {
        // Update validation messages based on current language
        const messages = {
            en: {
                'selectHotel': 'Please select a hotel',
                'selectRoomDates': 'Please select room type and dates',
                'checkoutAfterCheckin': 'Check-out date must be after check-in date',
                'fillRequiredFields': 'Please fill in all required fields',
                'invalidEmail': 'Please enter a valid email address',
                'passwordTooShort': 'Password must be at least 6 characters long',
                'passwordsDoNotMatch': 'Passwords do not match',
                'invalidName': 'Please enter a valid full name (at least 2 characters)',
                'userExists': 'User already exists with this email',
                'invalidCredentials': 'Invalid email or password',
                'signUpSuccess': 'Account created successfully! Welcome!',
                'signInSuccess': 'Welcome back!',
                'signOutSuccess': 'Signed out successfully',
                'bookingConfirmed': 'Hotel booking confirmed successfully!',
                'profileUpdated': 'Profile updated successfully!',
                'passwordUpdated': 'Password updated successfully!',
                'accountDeleted': 'Account deleted successfully',
                'bookingCancelled': 'Booking cancelled successfully'
            },
            ar: {
                'selectHotel': 'يرجى اختيار فندق',
                'selectRoomDates': 'يرجى اختيار نوع الغرفة والتواريخ',
                'checkoutAfterCheckin': 'يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول',
                'fillRequiredFields': 'يرجى ملء جميع الحقول المطلوبة',
                'invalidEmail': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
                'passwordTooShort': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
                'passwordsDoNotMatch': 'كلمات المرور غير متطابقة',
                'invalidName': 'يرجى إدخال اسم كامل صحيح (حرفين على الأقل)',
                'userExists': 'يوجد مستخدم مسجل بهذا البريد الإلكتروني',
                'invalidCredentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
                'signUpSuccess': 'تم إنشاء الحساب بنجاح! أهلاً وسهلاً!',
                'signInSuccess': 'أهلاً بعودتك!',
                'signOutSuccess': 'تم تسجيل الخروج بنجاح',
                'bookingConfirmed': 'تم تأكيد حجز الفندق بنجاح!',
                'profileUpdated': 'تم تحديث الملف الشخصي بنجاح!',
                'passwordUpdated': 'تم تحديث كلمة المرور بنجاح!',
                'accountDeleted': 'تم حذف الحساب بنجاح',
                'bookingCancelled': 'تم إلغاء الحجز بنجاح'
            }
        };
        
        this.validationMessages = messages[this.currentLanguage];
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateEmailField(field) {
        const value = field.value.trim();
        const isValid = this.isValidEmail(value);
        this.setFieldValidation(field, isValid, this.validationMessages.invalidEmail);
        return isValid;
    }

    validatePasswordField(field) {
        const value = field.value;
        const isValid = value.length >= 6;
        this.setFieldValidation(field, isValid, this.validationMessages.passwordTooShort);
        return isValid;
    }

    validateConfirmPasswordField(field) {
        const value = field.value;
        const password = document.getElementById('password').value;
        const isValid = value === password;
        this.setFieldValidation(field, isValid, this.validationMessages.passwordsDoNotMatch);
        return isValid;
    }

    validateNameField(field) {
        const value = field.value.trim();
        const isValid = value.length >= 2;
        this.setFieldValidation(field, isValid, this.validationMessages.invalidName);
        return isValid;
    }

    setFieldValidation(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        let errorElement = formGroup.querySelector('.field-error');
        
        if (!isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
            field.classList.add('error');
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            field.classList.remove('error');
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Authentication Methods
    showAuthModal(mode) {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('modalTitle');
        const submitText = document.getElementById('submitText');
        const switchText = document.getElementById('switchText');
        const switchBtn = document.getElementById('switchMode');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const nameGroup = document.getElementById('nameGroup');
        
        if (mode === 'signin') {
            title.setAttribute('data-en', 'Sign In');
            title.setAttribute('data-ar', 'تسجيل الدخول');
            title.textContent = this.currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Sign In';
            
            submitText.setAttribute('data-en', 'Sign In');
            submitText.setAttribute('data-ar', 'تسجيل الدخول');
            submitText.textContent = this.currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Sign In';
            
            switchText.setAttribute('data-en', "Don't have an account?");
            switchText.setAttribute('data-ar', 'ليس لديك حساب؟');
            switchText.textContent = this.currentLanguage === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?";
            
            switchBtn.setAttribute('data-en', 'Sign Up');
            switchBtn.setAttribute('data-ar', 'إنشاء حساب');
            switchBtn.textContent = this.currentLanguage === 'ar' ? 'إنشاء حساب' : 'Sign Up';
            
            confirmPasswordGroup.style.display = 'none';
            nameGroup.style.display = 'none';
        } else {
            title.setAttribute('data-en', 'Sign Up');
            title.setAttribute('data-ar', 'إنشاء حساب');
            title.textContent = this.currentLanguage === 'ar' ? 'إنشاء حساب' : 'Sign Up';
            
            submitText.setAttribute('data-en', 'Sign Up');
            submitText.setAttribute('data-ar', 'إنشاء حساب');
            submitText.textContent = this.currentLanguage === 'ar' ? 'إنشاء حساب' : 'Sign Up';
            
            switchText.setAttribute('data-en', 'Already have an account?');
            switchText.setAttribute('data-ar', 'لديك حساب بالفعل؟');
            switchText.textContent = this.currentLanguage === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?';
            
            switchBtn.setAttribute('data-en', 'Sign In');
            switchBtn.setAttribute('data-ar', 'تسجيل الدخول');
            switchBtn.textContent = this.currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Sign In';
            
            confirmPasswordGroup.style.display = 'block';
            nameGroup.style.display = 'block';
        }
        
        this.showModal('authModal');
    }

    switchAuthMode() {
        const title = document.getElementById('modalTitle');
        const isSignIn = title.textContent === 'Sign In' || title.textContent === 'تسجيل الدخول';
        this.showAuthModal(isSignIn ? 'signup' : 'signin');
    }

    handleAuth(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (this.currentLanguage === 'ar' ? 'جاري المعالجة...' : 'Processing...');
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const fullName = formData.get('fullName');
        const title = document.getElementById('modalTitle');
        const isSignUp = title.textContent === 'Sign Up' || title.textContent === 'إنشاء حساب';
        
        // Enhanced validation
        if (!email || !password) {
            this.resetFormButton(submitBtn, originalText);
            this.showNotification(this.validationMessages.fillRequiredFields, 'error');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.resetFormButton(submitBtn, originalText);
            this.showNotification(this.validationMessages.invalidEmail, 'error');
            return;
        }
        
        if (password.length < 6) {
            this.resetFormButton(submitBtn, originalText);
            this.showNotification(this.validationMessages.passwordTooShort, 'error');
            return;
        }
        
        if (isSignUp) {
            if (password !== confirmPassword) {
                this.resetFormButton(submitBtn, originalText);
                this.showNotification(this.validationMessages.passwordsDoNotMatch, 'error');
                return;
            }
            if (!fullName || fullName.trim().length < 2) {
                this.resetFormButton(submitBtn, originalText);
                this.showNotification(this.validationMessages.invalidName, 'error');
                return;
            }
            this.signUp(email, password, fullName);
        } else {
            this.signIn(email, password);
        }
        
        // Reset button after a delay
        setTimeout(() => {
            this.resetFormButton(submitBtn, originalText);
        }, 2000);
    }

    resetFormButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }

    signUp(email, password, fullName) {
        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            this.showNotification(this.validationMessages.userExists, 'error');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            email: email.toLowerCase().trim(),
            password,
            fullName: fullName.trim(),
            phone: '',
            bio: '',
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.currentUser = newUser;
        this.updateAuthUI();
        this.hideModal('authModal');
        this.showNotification(this.validationMessages.signUpSuccess, 'success');
    }

    signIn(email, password) {
        const user = this.users.find(u => u.email === email.toLowerCase().trim() && u.password === password);
        if (!user) {
            this.showNotification(this.validationMessages.invalidCredentials, 'error');
            return;
        }
        
        this.currentUser = user;
        this.updateAuthUI();
        this.hideModal('authModal');
        this.showNotification(this.validationMessages.signInSuccess, 'success');
    }

    signOut() {
        this.currentUser = null;
        this.updateAuthUI();
        this.showNotification(this.validationMessages.signOutSuccess, 'success');
    }

    updateAuthUI() {
        const signInBtn = document.getElementById('signInBtn');
        const signUpBtn = document.getElementById('signUpBtn');
        
        if (this.currentUser) {
            signInBtn.textContent = this.currentUser.fullName;
            signInBtn.onclick = () => this.showDashboard();
            signUpBtn.textContent = 'Sign Out';
            signUpBtn.onclick = () => this.signOut();
        } else {
            signInBtn.textContent = 'Sign In';
            signInBtn.onclick = () => this.showAuthModal('signin');
            signUpBtn.textContent = 'Sign Up';
            signUpBtn.onclick = () => this.showAuthModal('signup');
        }
    }

    checkAuthState() {
        // Check if user is already signed in (in a real app, this would be handled by tokens)
        this.updateAuthUI();
    }

    // Booking Methods
    showBookingModal() {
        if (!this.currentUser) {
            this.showAuthModal('signin');
            return;
        }
        
        this.resetBookingData();
        this.showModal('bookingModal');
    }

    resetBookingData() {
        this.currentStep = 1;
        this.bookingData = {
            hotel: null,
            roomType: null,
            checkInDate: null,
            checkOutDate: null,
            activities: [],
            name: this.currentUser?.fullName || '',
            phone: '',
            email: this.currentUser?.email || '',
            notes: ''
        };
        this.updateBookingSteps();
        this.updateBookingForm();
    }

    selectHotel(option) {
        document.querySelectorAll('.hotel-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        const hotel = option.dataset.hotel;
        this.bookingData.hotel = hotel;
    }

    selectRoom(option) {
        document.querySelectorAll('.room-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        const roomType = option.dataset.room;
        this.bookingData.roomType = roomType;
    }

    selectHotelFromCard(hotel) {
        this.showBookingModal();
        setTimeout(() => {
            const option = document.querySelector(`[data-hotel="${hotel}"]`);
            if (option) {
                this.selectHotel(option);
            }
        }, 100);
    }

    selectActivityFromCard(activity) {
        // Scroll to activities section
        this.scrollToSection('activities');
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateBookingSteps();
            this.updateBookingForm();
            this.updateSummary();
        }
    }

    prevStep() {
        this.currentStep--;
        this.updateBookingSteps();
        this.updateBookingForm();
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.bookingData.hotel) {
                    this.showNotification(this.validationMessages.selectHotel, 'error');
                    return false;
                }
                break;
            case 2:
                if (!this.bookingData.roomType || !this.bookingData.checkInDate || !this.bookingData.checkOutDate) {
                    this.showNotification(this.validationMessages.selectRoomDates, 'error');
                    return false;
                }
                if (new Date(this.bookingData.checkInDate) >= new Date(this.bookingData.checkOutDate)) {
                    this.showNotification(this.validationMessages.checkoutAfterCheckin, 'error');
                    return false;
                }
                break;
            case 3:
                // Activities are optional, so no validation needed
                this.collectSelectedActivities();
                break;
            case 4:
                const name = document.getElementById('bookingName').value;
                const phone = document.getElementById('bookingPhone').value;
                const email = document.getElementById('bookingEmail').value;
                
                if (!name || !phone || !email) {
                    this.showNotification(this.validationMessages.fillRequiredFields, 'error');
                    return false;
                }
                
                this.bookingData.name = name;
                this.bookingData.phone = phone;
                this.bookingData.email = email;
                this.bookingData.notes = document.getElementById('bookingNotes').value;
                break;
        }
        return true;
    }

    collectSelectedActivities() {
        this.bookingData.activities = [];
        document.querySelectorAll('input[name="activities"]:checked').forEach(checkbox => {
            this.bookingData.activities.push(checkbox.value);
        });
    }

    updateBookingSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Show/hide steps
        document.querySelectorAll('.booking-step').forEach((step, index) => {
            step.style.display = index + 1 === this.currentStep ? 'block' : 'none';
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const confirmBtn = document.getElementById('confirmBooking');
        
        prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        
        if (this.currentStep < 5) {
            nextBtn.style.display = 'block';
            confirmBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            confirmBtn.style.display = 'block';
        }
    }

    updateBookingForm() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkInDate').min = today;
        document.getElementById('checkOutDate').min = today;
        
        // Pre-fill user data if available
        if (this.currentUser) {
            document.getElementById('bookingName').value = this.currentUser.fullName;
            document.getElementById('bookingEmail').value = this.currentUser.email;
        }
    }

    onDateChange() {
        const checkInDate = document.getElementById('checkInDate').value;
        const checkOutDate = document.getElementById('checkOutDate').value;
        
        this.bookingData.checkInDate = checkInDate;
        this.bookingData.checkOutDate = checkOutDate;
        
        // Update check-out minimum date based on check-in
        if (checkInDate) {
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            document.getElementById('checkOutDate').min = nextDay.toISOString().split('T')[0];
        }
    }

    generateTimeSlots() {
        const timeGrid = document.getElementById('timeGrid');
        const slots = [];
        
        // Generate time slots from 9 AM to 6 PM
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const isAvailable = Math.random() > 0.3; // Random availability for demo
                
                slots.push({
                    time,
                    available: isAvailable
                });
            }
        }
        
        timeGrid.innerHTML = slots.map(slot => `
            <div class="time-slot ${!slot.available ? 'unavailable' : ''}" 
                 data-time="${slot.time}" 
                 ${!slot.available ? 'title="Not available"' : ''}>
                ${slot.time}
            </div>
        `).join('');
    }

    selectTimeSlot(slot) {
        if (slot.classList.contains('unavailable')) return;
        
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        this.bookingData.time = slot.dataset.time;
    }

    updateSummary() {
        const hotel = this.hotelData[this.bookingData.hotel];
        const roomType = this.roomTypes[this.bookingData.roomType];
        
        // Calculate nights
        const nights = this.bookingData.checkInDate && this.bookingData.checkOutDate ? 
            Math.ceil((new Date(this.bookingData.checkOutDate) - new Date(this.bookingData.checkInDate)) / (1000 * 60 * 60 * 24)) : 0;
        
        // Calculate total
        const basePrice = hotel ? hotel.basePrice : 0;
        const roomPrice = roomType ? roomType.price : 0;
        const activityPrice = this.bookingData.activities.reduce((total, activity) => {
            return total + (this.activities[activity] ? this.activities[activity].price : 0);
        }, 0);
        
        const total = (basePrice + roomPrice) * nights + activityPrice;
        
        document.getElementById('summaryHotel').textContent = hotel ? hotel.name : '-';
        document.getElementById('summaryRoom').textContent = roomType ? roomType.name : '-';
        document.getElementById('summaryCheckIn').textContent = this.bookingData.checkInDate || '-';
        document.getElementById('summaryCheckOut').textContent = this.bookingData.checkOutDate || '-';
        document.getElementById('summaryNights').textContent = nights || '-';
        document.getElementById('summaryActivities').textContent = this.bookingData.activities.length > 0 ? 
            this.bookingData.activities.map(a => this.activities[a].name).join(', ') : 'None';
        document.getElementById('summaryName').textContent = this.bookingData.name || '-';
        document.getElementById('summaryPhone').textContent = this.bookingData.phone || '-';
        document.getElementById('summaryEmail').textContent = this.bookingData.email || '-';
        document.getElementById('summaryTotal').textContent = `$${total}`;
    }

    handleBookingSubmit(e) {
        e.preventDefault();
        
        if (!this.validateCurrentStep()) return;
        
        const hotel = this.hotelData[this.bookingData.hotel];
        const roomType = this.roomTypes[this.bookingData.roomType];
        const nights = Math.ceil((new Date(this.bookingData.checkOutDate) - new Date(this.bookingData.checkInDate)) / (1000 * 60 * 60 * 24));
        
        const basePrice = hotel ? hotel.basePrice : 0;
        const roomPrice = roomType ? roomType.price : 0;
        const activityPrice = this.bookingData.activities.reduce((total, activity) => {
            return total + (this.activities[activity] ? this.activities[activity].price : 0);
        }, 0);
        
        const total = (basePrice + roomPrice) * nights + activityPrice;
        
        const booking = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            ...this.bookingData,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            total: total,
            nights: nights
        };
        
        this.bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        
        this.hideModal('bookingModal');
            this.showNotification(this.validationMessages.bookingConfirmed, 'success');
        this.loadUserBookings();
    }

    // Dashboard Methods
    showDashboard() {
        this.loadUserBookings();
        this.showModal('dashboardModal');
    }

    loadUserBookings() {
        if (!this.currentUser) return;
        
        const userBookings = this.bookings.filter(booking => booking.userId === this.currentUser.id);
        const upcoming = userBookings.filter(booking => 
            new Date(booking.date) >= new Date() && booking.status !== 'cancelled'
        );
        const history = userBookings.filter(booking => 
            new Date(booking.date) < new Date() || booking.status === 'cancelled'
        );
        
        this.renderBookings(upcoming, 'upcomingBookings');
        this.renderBookings(history, 'historyBookings');
    }

    renderBookings(bookings, containerId) {
        const container = document.getElementById(containerId);
        
        if (bookings.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No bookings found</p>';
            return;
        }
        
        container.innerHTML = bookings.map(booking => this.createBookingCard(booking)).join('');
    }

    createBookingCard(booking) {
        const hotel = this.hotelData[booking.hotel];
        const roomType = this.roomTypes[booking.roomType];
        
        const statusClass = {
            confirmed: 'confirmed',
            pending: 'pending',
            cancelled: 'cancelled'
        }[booking.status] || 'pending';
        
        return `
            <div class="booking-item-card">
                <div class="booking-item-header">
                    <div class="booking-service">${hotel ? hotel.name : 'Unknown Hotel'}</div>
                    <div class="booking-status ${statusClass}">${booking.status}</div>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <div class="booking-detail-label">Hotel</div>
                        <div class="booking-detail-value">${hotel ? hotel.name : 'Unknown'}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="booking-detail-label">Room</div>
                        <div class="booking-detail-value">${roomType ? roomType.name : 'Unknown'}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="booking-detail-label">Check-in</div>
                        <div class="booking-detail-value">${new Date(booking.checkInDate).toLocaleDateString()}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="booking-detail-label">Check-out</div>
                        <div class="booking-detail-value">${new Date(booking.checkOutDate).toLocaleDateString()}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="booking-detail-label">Nights</div>
                        <div class="booking-detail-value">${booking.nights || 0}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="booking-detail-label">Total</div>
                        <div class="booking-detail-value">$${booking.total}</div>
                    </div>
                </div>
                ${booking.activities && booking.activities.length > 0 ? 
                    `<div class="booking-activities"><strong>Activities:</strong> ${booking.activities.map(a => this.activities[a]?.name || a).join(', ')}</div>` : ''}
                ${booking.notes ? `<div class="booking-notes"><strong>Notes:</strong> ${booking.notes}</div>` : ''}
                <div class="booking-actions">
                    ${booking.status === 'confirmed' && new Date(booking.checkInDate) > new Date() ? 
                        `<button class="btn btn-danger btn-sm" onclick="hotelBookingSystem.cancelBooking('${booking.id}')">Cancel</button>` : ''}
                </div>
            </div>
        `;
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const booking = this.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'cancelled';
                localStorage.setItem('bookings', JSON.stringify(this.bookings));
                this.loadUserBookings();
                this.showNotification('Booking cancelled successfully', 'success');
            }
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Load profile data when switching to profile tab
        if (tab === 'profile' && this.currentUser) {
            this.loadProfileData();
        }
    }

    // Profile Management Methods
    loadProfileData() {
        if (!this.currentUser) return;
        
        // Update profile header
        document.getElementById('profileName').textContent = this.currentUser.fullName;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        
        // Update profile form
        document.getElementById('profileFullName').value = this.currentUser.fullName || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        document.getElementById('profileEmailField').value = this.currentUser.email || '';
        document.getElementById('profileBio').value = this.currentUser.bio || '';
        
        // Update profile stats
        const userBookings = this.bookings.filter(booking => booking.userId === this.currentUser.id);
        const totalSpent = userBookings.reduce((sum, booking) => sum + (booking.total || 0), 0);
        const memberSince = new Date(this.currentUser.createdAt).getFullYear();
        
        document.getElementById('totalBookings').textContent = userBookings.length;
        document.getElementById('totalSpent').textContent = `$${totalSpent}`;
        document.getElementById('memberSince').textContent = memberSince;
    }

    handleProfileUpdate(e) {
        e.preventDefault();
        
        if (!this.currentUser) return;
        
        const formData = new FormData(e.target);
        const updates = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            bio: formData.get('bio')
        };
        
        // Update user data
        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.currentUser = this.users[userIndex];
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // Update UI
            this.loadProfileData();
            this.updateAuthUI();
            
            this.showNotification(this.validationMessages.profileUpdated, 'success');
        }
    }


    showChangePasswordModal() {
        const currentPassword = prompt('Enter current password:');
        if (!currentPassword) return;
        
        if (currentPassword !== this.currentUser.password) {
            this.showNotification('Current password is incorrect', 'error');
            return;
        }
        
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;
        
        const confirmPassword = prompt('Confirm new password:');
        if (newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Update password
        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].password = newPassword;
            this.currentUser.password = newPassword;
            localStorage.setItem('users', JSON.stringify(this.users));
            this.showNotification(this.validationMessages.passwordUpdated, 'success');
        }
    }

    deleteAccount() {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }
        
        const confirmText = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmText !== 'DELETE') {
            this.showNotification('Account deletion cancelled', 'error');
            return;
        }
        
        // Remove user and their bookings
        this.users = this.users.filter(user => user.id !== this.currentUser.id);
        this.bookings = this.bookings.filter(booking => booking.userId !== this.currentUser.id);
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        
        this.currentUser = null;
        this.updateAuthUI();
        this.hideModal('dashboardModal');
        this.showNotification(this.validationMessages.accountDeleted, 'success');
    }

    // Mobile Menu Methods
    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        const isExpanded = navMenu.classList.contains('active');
        
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', !isExpanded);
        
        // Close menu when clicking on a link
        if (!isExpanded) {
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    // Utility Methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = 'auto';
    }

    showNotification(message, type = 'success') {
        try {
            const notification = document.getElementById('successNotification');
            if (!notification) {
                console.error('Notification element not found');
                return;
            }
            
            const content = notification.querySelector('span');
            if (!content) {
                console.error('Notification content element not found');
                return;
            }
            
            content.textContent = message;
            
            // Remove existing type classes
            notification.classList.remove('success', 'error', 'warning', 'info');
            
            if (type === 'error') {
                notification.style.background = '#ef4444';
                notification.querySelector('i').className = 'fas fa-exclamation-circle';
                notification.classList.add('error');
            } else if (type === 'warning') {
                notification.style.background = '#f59e0b';
                notification.querySelector('i').className = 'fas fa-exclamation-triangle';
                notification.classList.add('warning');
            } else if (type === 'info') {
                notification.style.background = '#3b82f6';
                notification.querySelector('i').className = 'fas fa-info-circle';
                notification.classList.add('info');
            } else {
                notification.style.background = '#10b981';
                notification.querySelector('i').className = 'fas fa-check-circle';
                notification.classList.add('success');
            }
            
            notification.classList.add('show');
            
            // Announce to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                notification.classList.remove('show');
                if (document.body.contains(announcement)) {
                    document.body.removeChild(announcement);
                }
            }, 4000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        navMenu.classList.toggle('active');
    }

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize the hotel booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hotelBookingSystem = new HotelBookingSystem();
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll effect to navbar with throttling for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            const navbar = document.querySelector('.navbar');
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (window.scrollY > 100) {
                if (isDarkMode) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.98)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                }
                navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
            } else {
                if (isDarkMode) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                }
                navbar.style.boxShadow = 'none';
            }
        }, 10);
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
            }
        });
    }, observerOptions);
    
    // Observe service cards and other elements
    document.querySelectorAll('.service-card, .section-header').forEach(el => {
        observer.observe(el);
    });
});

// Add some demo data for testing
if (!localStorage.getItem('users')) {
    const demoUsers = [
        {
            id: '1',
            email: 'demo@example.com',
            password: 'demo123',
            fullName: 'Demo User',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
}

// Add some demo bookings
if (!localStorage.getItem('bookings')) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
    
    const demoBookings = [
        {
            id: '1',
            userId: '1',
            hotel: 'burj-al-arab',
            roomType: 'suite',
            checkInDate: tomorrow,
            checkOutDate: dayAfter,
            activities: ['spa', 'dining'],
            name: 'Demo User',
            phone: '+1 (555) 123-4567',
            email: 'demo@example.com',
            notes: 'Anniversary celebration',
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            total: 2300,
            nights: 1
        }
    ];
    localStorage.setItem('bookings', JSON.stringify(demoBookings));
}
