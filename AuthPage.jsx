import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, signOut, sendEmailVerification, sendPasswordResetEmail, fetchSignInMethodsForEmail, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { Button, TextField, Typography, Container, Box, Paper, Divider, Alert, CircularProgress, Tabs, Tab, IconButton, Link } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { initializeApp } from 'firebase/app';
import { useProxy } from 'valtio/utils';

// Make sure Firebase app is initialized before calling getAuth
// This might be done in index.html or another central place
// Initialize Firebase with project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGAXFpKqqToJ6QFGodhzlQKt1WneQN19s",
    authDomain: "nub-live.firebaseapp.com",
    projectId: "nub-live",
    storageBucket: "nub-live.firebasestorage.app",
    messagingSenderId: "800603073230",
    appId: "1:800603073230:web:9971104fe7992012b5fe9f",
    measurementId: "G-VV61301VDD"
};

const auth = getAuth(app);

function AuthPage() {
    const navigate = useNavigate();
    // Check if user is already logged in using the global state
    const globalState = useProxy(window.state);
    const [redirecting, setRedirecting] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // For success messages
    const [loading, setLoading] = useState(''); // To indicate loading state for different actions
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [recaptchaReset, setRecaptchaReset] = useState(0); // Add state to trigger reCAPTCHA re-initialization
    const recaptchaContainerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);
    const [verificationSent, setVerificationSent] = useState(false); // Track if verification email was sent
    const [resetPasswordSent, setResetPasswordSent] = useState(false); // Track if password reset email was sent
    const [activeTab, setActiveTab] = useState(0); // Track active tab: 0 = Email, 1 = Google, 2 = Phone

    // Check if user is already logged in and redirect if needed
    useEffect(() => {
        // If user is logged in (not anonymously) and email is verified (or using a different auth method)
        if (globalState.user && !globalState.isAnonymous &&
            (globalState.emailVerified || globalState.user.providerData[0]?.providerId !== 'password')) {
            console.log("User already logged in, redirecting to home page");
            setRedirecting(true);
            // Use a short timeout to prevent any UI flicker
            setTimeout(() => {
                window.location.hash = "#/";
            }, 10);
        } else if (globalState.user && globalState.isAnonymous) {
            // If user is anonymous, sign them out so they can sign in properly
            // console.log("User is anonymous, signing out to allow proper sign in");
            // signOut(auth);
        }
    }, [globalState.user, globalState.emailVerified, globalState.isAnonymous]);

    // State to track if we need to show the Google sign-in button for password setup
    const [showGoogleSignInForPasswordSetup, setShowGoogleSignInForPasswordSetup] = useState(false);

    // Initialize reCAPTCHA when the phone tab is active
    useEffect(() => {
        // Only initialize reCAPTCHA when the phone tab is active
        if (activeTab !== 2) {
            return; // Skip initialization if not on phone tab
        }

        console.log("Phone tab is active, initializing reCAPTCHA");

        // Delay initialization slightly to ensure DOM is ready
        const initTimer = setTimeout(() => {
            try {
                // Clear any existing reCAPTCHA instances
                if (window.recaptchaWidgetId) {
                    if (typeof grecaptcha !== 'undefined' && grecaptcha && grecaptcha.reset) {
                        try {
                            grecaptcha.reset(window.recaptchaWidgetId);
                        } catch (e) {
                            console.log("Could not reset existing reCAPTCHA");
                        }
                    }
                    window.recaptchaWidgetId = null;
                }

                // Clear the reference if it exists
                if (recaptchaVerifierRef.current) {
                    try {
                        recaptchaVerifierRef.current.clear();
                    } catch (e) {
                        console.log("Could not clear existing reCAPTCHA verifier");
                    }
                    recaptchaVerifierRef.current = null;
                }

                // Clear the container
                if (recaptchaContainerRef.current) {
                    recaptchaContainerRef.current.innerHTML = '';
                }

                // Create a new instance only if we don't already have one
                if (recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
                    // Create a new RecaptchaVerifier
                    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                        'size': 'normal',
                        'callback': () => {
                            console.log("reCAPTCHA verified");
                        },
                        'expired-callback': () => {
                            console.log("reCAPTCHA expired");
                            setError('reCAPTCHA verification expired. Please try again.');
                            // Don't call resetRecaptcha here to avoid infinite loop
                            setRecaptchaReset(prev => prev + 1);
                        }
                    });

                    // Render the reCAPTCHA
                    recaptchaVerifierRef.current.render()
                        .then(widgetId => {
                            window.recaptchaWidgetId = widgetId;
                            console.log("reCAPTCHA rendered successfully with ID:", widgetId);
                        })
                        .catch(err => {
                            console.error("Recaptcha render error:", err);
                            setError('Failed to render reCAPTCHA. Please refresh the page and try again.');
                            recaptchaVerifierRef.current = null;
                        });
                }
            } catch (error) {
                console.error("Error in reCAPTCHA initialization:", error);
                setError('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
            }
        }, 500); // Reduced delay to 500ms for faster initialization

        // Cleanup function
        return () => {
            clearTimeout(initTimer);
            // Don't call resetRecaptcha here to avoid circular dependencies
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (e) {
                    console.log("Could not clear reCAPTCHA verifier during cleanup");
                }
                recaptchaVerifierRef.current = null;
            }
        };
    }, [activeTab, recaptchaReset]); // Re-run when activeTab or recaptchaReset changes

    const resetRecaptcha = () => {
        console.log("Resetting reCAPTCHA...");

        try {
            // Clear global widget if it exists
            if (window.recaptchaWidgetId) {
                if (typeof grecaptcha !== 'undefined' && grecaptcha && grecaptcha.reset) {
                    try {
                        grecaptcha.reset(window.recaptchaWidgetId);
                    } catch (e) {
                        console.log("Could not reset global reCAPTCHA widget");
                    }
                }
                window.recaptchaWidgetId = null;
            }

            // Clear the verifier if it exists
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (e) {
                    console.log("Could not clear reCAPTCHA verifier");
                }
                recaptchaVerifierRef.current = null;
            }

            // Clear the container
            if (recaptchaContainerRef.current) {
                recaptchaContainerRef.current.innerHTML = '';
            }
        } catch (error) {
            console.error("Error during reCAPTCHA reset:", error);
        }

        // Make sure we're on the phone tab
        if (activeTab !== 2) {
            setActiveTab(2); // Switch to phone tab
        }

        // Increment the reset counter to trigger re-initialization in useEffect
        // Use a small timeout to ensure DOM updates before re-initialization
        setTimeout(() => {
            setRecaptchaReset(prev => prev + 1);
        }, 100);
    };

    // Function to resend verification email
    const resendVerificationEmail = async () => {
        setLoading('resendVerification');
        setError('');
        setSuccess('');
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await sendEmailVerification(currentUser);
                setSuccess('Verification email sent! Please check your inbox and spam folder.');
            } else {
                // We already have the email in the state if verification was sent
                if (email && password) {
                    try {
                        // Sign in temporarily to send verification email
                        const userCredential = await signInWithEmailAndPassword(auth, email, password);
                        await sendEmailVerification(userCredential.user);
                        await signOut(auth); // Sign out again
                        setSuccess('Verification email sent! Please check your inbox and spam folder.');

                        // Set verification sent state
                        setVerificationSent(true);
                    } catch (signInError) {
                        console.error('Error signing in to resend verification:', signInError);
                        setError('Please check your password and try again.');
                    }
                } else {
                    setError('Please enter your email and password to resend the verification email.');
                }
            }
        } catch (err) {
            console.error('Error sending verification email:', err);
            setError(err.message || 'Failed to send verification email. Please try again.');
        } finally {
            setLoading('');
        }
    };

    // Function to handle password reset
    const handleForgotPassword = async () => {
        setLoading('forgotPassword');
        setError('');
        setSuccess('');
        try {
            if (!email) {
                setError('Please enter your email address to reset your password.');
                return;
            }

            // Check if the email is associated with any account
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);

            // Debug: Log the sign-in methods for this email
            console.log('Sign-in methods for email:', email, signInMethods);

            // If the user has only signed in with Google (no password provider)
            if (signInMethods.includes('google.com') && !signInMethods.includes('password')) {
                try {
                    // For Google-only accounts, we need to create a temporary random password
                    // and link the email/password provider before sending a reset email

                    // Check if the user is currently signed in with this Google account
                    const currentUser = auth.currentUser;
                    if (currentUser && currentUser.email === email &&
                        currentUser.providerData.some(p => p.providerId === 'google.com')) {

                        // User is signed in with this Google account, we can link directly
                        // Generate a random temporary password (this will be reset immediately)
                        const tempPassword = Math.random().toString(36).slice(-10) +
                                            Math.random().toString(36).toUpperCase().slice(-2) +
                                            Math.random().toString(10).slice(-2);

                        // Create email credential with the temporary password
                        const credential = EmailAuthProvider.credential(email, tempPassword);

                        // Link the credential to the current user
                        console.log('Attempting to link credential to user:', currentUser.uid);
                        const linkResult = await linkWithCredential(currentUser, credential);
                        console.log('Credential linking successful:', linkResult);

                        // Now send the password reset email
                        console.log('Sending password reset email to:', email);
                        await sendPasswordResetEmail(auth, email);
                        console.log('Password reset email sent successfully');

                        setResetPasswordSent(true);
                        setSuccess('Password reset email sent! Since you signed in with Google, this will allow you to set a password for your account. Please check your inbox and spam folder.');
                    } else {
                        // User is not currently signed in with this Google account
                        // We can't link providers without the user being signed in
                        // Show a special message and a Google sign-in button
                        setError('');
                        setResetPasswordSent(true);
                        setShowGoogleSignInForPasswordSetup(true);
                        setSuccess('To add a password to your Google account, please sign in with Google first using the button below, then try again.');
                    }
                } catch (linkError) {
                    console.error('Error linking email/password to Google account:', linkError);
                    console.error('Error code:', linkError.code);
                    console.error('Error message:', linkError.message);

                    // Show a more detailed error message
                    if (linkError.code === 'auth/provider-already-linked') {
                        // This shouldn't happen since we checked, but just in case
                        setError('This account already has a password. Please use the "Reset Password" option instead.');
                    } else if (linkError.code === 'auth/email-already-in-use') {
                        setError('This email is already associated with another account. Please use a different email.');
                    } else if (linkError.code === 'auth/requires-recent-login') {
                        // Force the user to reauthenticate
                        setError('For security reasons, please sign out and sign in again with Google before adding a password.');
                    } else {
                        setError(`Unable to add password authentication to your Google account: ${linkError.message}. Please try signing in with Google and then setting a password from your profile page.`);
                    }
                }
                return;
            }

            // If the user has a password provider (or other providers)
            if (signInMethods.length > 0) {
                // Normal password reset flow
                console.log('Sending normal password reset email to:', email);
                try {
                    await sendPasswordResetEmail(auth, email);
                    console.log('Normal password reset email sent successfully');
                    setResetPasswordSent(true);
                    setSuccess('Password reset email sent! Please check your inbox and spam folder.');
                } catch (resetError) {
                    console.error('Error sending normal password reset email:', resetError);
                    console.error('Error code:', resetError.code);
                    console.error('Error message:', resetError.message);
                    setError(`Failed to send password reset email: ${resetError.message}`);
                }
                return;
            }

            // If fetchSignInMethodsForEmail returns an empty array, it could mean:
            // 1. The account doesn't exist
            // 2. The account exists but fetchSignInMethodsForEmail is not returning the providers correctly

            console.log('No sign-in methods found for email, but account might still exist');

            // Let's try to send a password reset email anyway
            try {
                console.log('Attempting to send password reset email despite no sign-in methods found');
                await sendPasswordResetEmail(auth, email);
                console.log('Password reset email sent successfully');
                setResetPasswordSent(true);
                setSuccess('Password reset email sent! Please check your inbox and spam folder.');
            } catch (resetError) {
                console.error('Error sending password reset email:', resetError);

                if (resetError.code === 'auth/user-not-found') {
                    // Now we're sure the account doesn't exist
                    console.log('Confirmed: No account found with this email');
                    setResetPasswordSent(true);
                    setShowGoogleSignInForPasswordSetup(true);
                    setSuccess(`No account found with email ${email}. You can sign in with Google to create an account, or sign up with email and password.`);
                } else {
                    // Some other error occurred
                    setError(`Failed to send password reset email: ${resetError.message}`);
                }
            }

        } catch (err) {
            console.error('Error sending password reset email:', err);

            // This is the outer catch block, which should only be reached if there was an error
            // with fetchSignInMethodsForEmail or some other unexpected error
            console.error('Unexpected error in handleForgotPassword:', err);

            // For all errors in this outer catch block, show the error message
            setError(`An unexpected error occurred: ${err.message}. Please try again.`);
        } finally {
            setLoading('');
        }
    };

    const handleAuthAction = async (action, provider = null) => {
        setLoading(action); // e.g., 'emailSignUp', 'googleSignIn', 'phoneSignIn'
        setError('');
        setSuccess('');
        try {
            switch (action) {
                case 'emailSignUp':
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        // Send email verification
                        await sendEmailVerification(userCredential.user);
                        // Navigate to home page
                        window.location.hash = `#/`;
                    } catch (error) {
                        console.error("Error during sign up:", error);
                        throw error; // Re-throw to be caught by the outer catch block
                    }
                    break;
                case 'emailSignIn':
                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        // Navigate to home page
                        window.location.hash = `#/`;
                        // Check if email is verified
                    } catch (error) {
                        console.error("Error during sign in:", error);
                        throw error; // Re-throw to be caught by the outer catch block
                    }
                    break;
                case 'googleSignIn':
                    const googleProvider = provider || new GoogleAuthProvider();
                    googleProvider.setCustomParameters({ display: 'popup' });
                    await signInWithPopup(auth, googleProvider);

                    // If this was for password setup, show a message to try the forgot password again
                    if (showGoogleSignInForPasswordSetup) {
                        setShowGoogleSignInForPasswordSetup(false);
                        setResetPasswordSent(false);
                        setSuccess('You are now signed in with Google. Please try the "Forgot Password" option again to set a password.');
                    }
                    break;
                case 'facebookSignIn':
                    const facebookProvider = provider || new FacebookAuthProvider();
                    facebookProvider.setCustomParameters({ display: 'popup' });
                    await signInWithPopup(auth, facebookProvider);
                    // User signed in
                    break;
                case 'phoneSignIn':
                    // Make sure we're on the phone tab
                    if (activeTab !== 2) {
                        setActiveTab(2);
                        // Give a moment for the tab to render
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }

                    // Check if reCAPTCHA is initialized
                    if (!recaptchaVerifierRef.current) {
                        console.log("reCAPTCHA not initialized, attempting to initialize it now");
                        setError('Initializing reCAPTCHA, please wait...');
                        // Try to reset and initialize reCAPTCHA
                        resetRecaptcha();
                        // Wait a bit for reCAPTCHA to initialize
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Check again if it's initialized
                        if (!recaptchaVerifierRef.current) {
                            setError('reCAPTCHA could not be initialized. Please refresh the page and try again.');
                            setLoading('');
                            return;
                        }
                        setError(''); // Clear the error if reCAPTCHA is now initialized
                    }

                    try {
                        // Format phone number if needed (ensure it has country code)
                        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+88${phoneNumber}`;

                        // Attempt to send OTP
                        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
                        setConfirmationResult(confirmation);
                        setShowOtpInput(true);
                        console.log("OTP sent successfully");
                    } catch (phoneError) {
                        console.error("Error sending OTP:", phoneError);
                        setError(phoneError.message || 'Failed to send verification code. Please check your phone number and try again.');
                        // Reset reCAPTCHA for next attempt
                        resetRecaptcha();
                        throw phoneError; // Re-throw to be caught by the outer catch block
                    }
                    break;
                case 'verifyOtp':
                    if (!confirmationResult) {
                        setError('Please request an OTP first.');
                        setLoading('');
                        return;
                    }
                    await confirmationResult.confirm(otp);
                    // User signed in
                    setShowOtpInput(false); // Hide OTP input after successful verification
                    setPhoneNumber(''); // Clear phone number
                    setOtp(''); // Clear OTP
                    resetRecaptcha(); // Reset reCAPTCHA for potential future use
                    break;
                default:
                    throw new Error('Invalid action');
            }
            // On successful sign-in/sign-up, the onAuthStateChanged listener in index.html should handle the redirect/UI update.
        } catch (err) {
            console.error(`Error during ${action}:`, err);
            setError(err.message || 'An unknown error occurred.');

            // Reset reCAPTCHA on phone sign-in failure to allow retry
            if (action === 'phoneSignIn' || action === 'verifyOtp') {
                // This will now properly reset and re-initialize reCAPTCHA
                resetRecaptcha();
            }
        } finally {
            setLoading('');
        }
    };

    // If auth is still loading or user is already logged in and being redirected, show nothing to prevent UI flicker
    if (globalState.authLoading || redirecting) {
        return null;
    }

    // We're not using tabs anymore, but we keep the activeTab state for the phone verification

    return (
        <div className="h-screen w-full flex flex-col overflow-auto">
            <div className="grow"></div>
            <Container component="main" maxWidth="xs" className="flex my-6 items-center justify-center">
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between', width: '100%' }}>
                        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
                            <Icons.ArrowBack />
                        </IconButton>
                        <Typography component="h1" variant="h5">
                            Sign In / Sign Up
                        </Typography>
                        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }} className="!opacity-0 pointer-events-none">
                            <Icons.ArrowBack />
                        </IconButton>
                    </Box>
                    {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}

                    {/* Resend verification email button */}
                    {verificationSent && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <Button
                                type="button"
                                fullWidth
                                variant="text"
                                color="primary"
                                onClick={resendVerificationEmail}
                                disabled={loading === 'resendVerification'}
                                startIcon={loading === 'resendVerification' ? <CircularProgress size={20} /> : <Icons.Email />}
                            >
                                Resend Verification Email
                            </Button>
                        </Box>
                    )}

                    {/* Resend password reset email button */}
                    {resetPasswordSent && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            {showGoogleSignInForPasswordSetup ? (
                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleAuthAction('googleSignIn')}
                                    disabled={!!loading}
                                    startIcon={loading === 'googleSignIn' ? <CircularProgress size={20} /> : <Icons.Google />}
                                    sx={{ mb: 2 }}
                                >
                                    Sign in with Google
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    fullWidth
                                    variant="text"
                                    color="primary"
                                    onClick={handleForgotPassword}
                                    disabled={loading === 'forgotPassword'}
                                    startIcon={loading === 'forgotPassword' ? <CircularProgress size={20} /> : <Icons.LockReset />}
                                >
                                    Resend Password Reset Email
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Tabs for different auth methods */}
                    {/* <Box sx={{ width: '100%', mt: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            aria-label="authentication methods"
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab icon={<Icons.Email />} label="Email" iconPosition="start" />
                            <Tab icon={<Icons.Login />} label="Social" iconPosition="start" />
                            <Tab icon={<Icons.Phone />} label="Phone" iconPosition="start" />
                        </Tabs>
                    </Box> */}

                    {/* Tab Content */}
                    <Box sx={{ width: '100%', mt: 2, minHeight: '240px' }}>
                        {/* Email/Password Form */}
                        <Box component="form" noValidate sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                placeholder="john@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!!loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                placeholder="At least 6 characters"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!!loading}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    onClick={() => handleAuthAction('emailSignIn')}
                                    disabled={!!loading}
                                    sx={{ flexGrow: 1, mr: 1 }}
                                >
                                    {loading === 'emailSignIn' ? <CircularProgress size={24} /> : 'Sign In'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => handleAuthAction('emailSignUp')}
                                    disabled={!!loading}
                                    sx={{ flexGrow: 1, ml: 1 }}
                                >
                                    {loading === 'emailSignUp' ? <CircularProgress size={24} /> : 'Sign Up'}
                                </Button>
                            </Box>

                            {/* Forgot Password Link */}
                            <Box sx={{ width: '100%', textAlign: 'center', mt: 1 }}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={handleForgotPassword}
                                    disabled={!!loading || !email}
                                    sx={{
                                        cursor: 'pointer',
                                        color: !!loading || !email ? 'text.disabled' : 'primary.main'
                                    }}
                                >
                                    {loading === 'forgotPassword' ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CircularProgress size={16} sx={{ mr: 1 }} />
                                            Sending...
                                        </Box>
                                    ) : (
                                        'Forgot Password?'
                                    )}
                                </Link>
                            </Box>
                        </Box>

                        {/* Phone Number Sign-In */}
                        {false && (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                {!showOtpInput ? (
                                    <>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="phone"
                                            label="Phone Number (e.g., 01234567890)"
                                            name="phone"
                                            autoComplete="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={!!loading}
                                        />
                                        {/* reCAPTCHA container */}
                                        <div
                                            ref={recaptchaContainerRef}
                                            id="recaptcha-container"
                                            style={{
                                                marginTop: '16px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                height: '80px',
                                                overflow: 'visible',
                                                paddingBottom: '20px'
                                            }}
                                        ></div>
                                        <Button
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleAuthAction('phoneSignIn')}
                                            disabled={!!loading || !phoneNumber}
                                            sx={{ mt: 2, mb: 2 }}
                                        >
                                            {loading === 'phoneSignIn' ? <CircularProgress size={24} /> : 'Send OTP'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="otp"
                                            label="Verification Code"
                                            name="otp"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            disabled={!!loading}
                                        />
                                        <Button
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleAuthAction('verifyOtp')}
                                            disabled={!!loading || !otp}
                                            sx={{ mt: 1, mb: 2 }}
                                        >
                                            {loading === 'verifyOtp' ? <CircularProgress size={24} /> : 'Verify OTP'}
                                        </Button>
                                        <Button
                                            type="button"
                                            fullWidth
                                            variant="text"
                                            onClick={() => {
                                                setShowOtpInput(false);
                                                setError('');
                                                resetRecaptcha(); // This will now properly reset and re-initialize reCAPTCHA
                                            }}
                                            disabled={!!loading}
                                            size="small"
                                        >
                                            Change Phone Number / Resend OTP
                                        </Button>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ width: '100%', my: 2 }}>OR</Divider>

                    {/* Continue as Guest Button */}
                    <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        color="info"
                        startIcon={<Icons.PersonOutline />}
                        onClick={() => {
                            // Navigate to home page
                            window.location.hash = "#/";
                        }}
                        sx={{ mb: 2 }}
                    >
                        Continue as Guest
                    </Button>
                    <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        startIcon={<Icons.Google />}
                        onClick={() => handleAuthAction('googleSignIn')}
                        disabled={!!loading}
                        sx={{
                            backgroundColor: loading === 'googleSignIn' ? 'inherit' : '#1877F2',
                            color: loading === 'googleSignIn' ? 'inherit' : 'white',
                            '&:hover': {
                                backgroundColor: loading === 'googleSignIn' ? 'inherit' : '#0d6efd'
                            }
                        }}
                    >
                        {loading === 'googleSignIn' ? <CircularProgress size={24} /> : 'Sign in with Google'}
                    </Button>
                </Paper>
            </Container>
            <div className="grow"></div>
        </div>
    );
}

export default AuthPage;