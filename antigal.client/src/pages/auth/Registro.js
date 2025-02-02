import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registrationSchema } from '../../validations/validationSchemas';
import DOMPurify from 'dompurify';

const Registro = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad de la contraseña

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const passwordValue = watch('password', '');

  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const checkPasswordConditions = (password) => {
    setPasswordConditions({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  useEffect(() => {
    checkPasswordConditions(passwordValue);
  }, [passwordValue]);

  const allConditionsMet = Object.values(passwordConditions).every((value) => value === true);

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input);
  };

  const onSubmit = async (data) => {
    console.log('data, antes de sanitizar: ', data);
    
    const clientUri = `${window.location.origin}/authentication/confirm-email`;
    
    const sanitizedData = {
      ...data,
      clientUri, // Añadido
    };
  
    // Sanitizar los datos
    const sanitizedDataSanitized = {};
    for (const key in sanitizedData) {
      sanitizedDataSanitized[key] = sanitizeInput(sanitizedData[key]);
    }
  
    console.log('estoy mandando: ', sanitizedDataSanitized);
    
    try {
      const response = await fetch('https://www.antigal.somee.com/api/accounts/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedDataSanitized),
      });
  
      if (response.ok) {
        toast.success('¡Usuario registrado con éxito! Revisa tu correo electrónico para confirmar tu cuenta.');
        navigate('/registration-success'); // Redirigir a la página de éxito
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al registrarse.');
      }
    } catch (err) {
      console.error('Error al registrarse:', err);
      toast.error('Error al registrarse. Inténtalo de nuevo más tarde.');
    }
  };
  
  // Alterna la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="auth-page fondoAuth">
      <div className="auth-container">
        <img src="./icons/iconoAntigal.png" alt="Logo" />
        <h2>Registro</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="firstName">Nombre:</label>
            <input
              type="text"
              id="firstName"
              {...register('firstName')}
              placeholder="Ingresa tu nombre de usuario"
              autoComplete="username"
            />
            {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Apellido:</label>
            <input
              type="text"
              id="lastName"
              {...register('lastName')}
              placeholder="Ingresa tu nombre completo"
              autoComplete="lastname"
            />
            {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="Ingresa tu correo electrónico"
              autoComplete="email"
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                placeholder="Ingresa tu contraseña"
                autoComplete="new-password"
              />
              <div
                onClick={togglePasswordVisibility}
                className="toggle-password ojo"
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? (
                  <img src="/icons/ojo-cerrado.png" alt="Ocultar contraseña" />
                ) : (
                  <img src="/icons/ojoAbierto.png" alt="Mostrar contraseña" />
                )}
              </div>
            </div>
            {errors.password && <p className="error-message">{errors.password.message}</p>}
            {!allConditionsMet && (
              <div className="password-conditions">
                <p className={passwordConditions.length ? 'condition met' : 'condition unmet'}>
                  • Al menos 8 caracteres
                </p>
                <p className={passwordConditions.lowercase ? 'condition met' : 'condition unmet'}>
                  • Al menos una letra minúscula
                </p>
                <p className={passwordConditions.uppercase ? 'condition met' : 'condition unmet'}>
                  • Al menos una letra mayúscula
                </p>
                <p className={passwordConditions.number ? 'condition met' : 'condition unmet'}>
                  • Al menos un número
                </p>
                <p className={passwordConditions.specialChar ? 'condition met' : 'condition unmet'}>
                  • Al menos un carácter especial (@$!%*?&)
                </p>
              </div>
            )}
            {allConditionsMet && (
              <p className="password-secure-message">¡La contraseña es segura!</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="Confirma tu contraseña"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button type="submit" className="cta-button primary">
            Registrarse
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">¿Ya tienes una cuenta? Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Registro;
