import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import userAPI from '@/shared/@common/api/userAPI';
import authenticationAPI from '@/shared/@common/api/authenticationAPI';
import { useModal } from '@/shared/@common/ui/Modal/hook/modalHook';

interface useCheckUserDataProps {
  email?: string;
  password?: string;
  passwordRepeat?: string;
  type?: string;
}

interface ErrorType {
  message?: string;
  response?: {
    status: number;
  };
}

export function useCheckUserData({
  email = '',
  password = '',
  passwordRepeat = password,
  type = 'employee',
}: useCheckUserDataProps) {
  const [emailError, setEmailError] = useState<string | undefined>('');
  const [passwordError, setPasswordError] = useState<string | undefined>('');
  const [passwordRepeatError, setPasswordRepeatError] = useState<
    string | undefined
  >('');
  const [isEmailError, setIsEmailError] = useState(true);
  const [isPasswordError, setIsPasswordError] = useState(true);
  const [isPasswordRepeatError, setIsPasswordRepeatError] = useState(true);

  const [isEmailCheck, setIsEmailCheck] = useState(false);
  const [isPasswordCheck, setIsPasswordCheck] = useState(false);
  const [isPasswordRepeatCheck, setIsPasswordRepeatCheck] = useState(false);

  const [selectedUserType, setSelectedUserType] = useState(type);

  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState('notice');

  const { isOpen, setIsOpen, closeModal } = useModal({});

  const EMAIL_CHECK = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  const PASSWORD_CHECK = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,30}$/;

  const emailValue = email.trim();
  const passwordValue = password.trim();
  const passwordRepeatValue = passwordRepeat.trim();

  const router = useRouter();

  const CheckEmail = () => {
    if (emailValue !== '') {
      if (EMAIL_CHECK.test(emailValue)) {
        setEmailError(undefined);
        setIsEmailError(false);
        setIsEmailCheck(true);
      } else {
        setEmailError('이메일 형식이 아닙니다!');
        setIsEmailError(true);
      }
    } else {
      setEmailError(undefined);
      setIsEmailError(false);
    }
  };

  const CheckPassword = () => {
    if (passwordValue !== '') {
      if (PASSWORD_CHECK.test(passwordValue)) {
        setPasswordError(undefined);
        setIsPasswordError(false);
        setIsPasswordCheck(true);
      } else {
        setPasswordError('비밀번호는 영문,숫자 조합으로 8자 이상 적어주세요!');
        setIsPasswordError(true);
      }
    } else {
      setPasswordError(undefined);
      setIsPasswordError(false);
    }
  };

  const CheckPasswordRepeat = () => {
    if (passwordRepeatValue !== '') {
      if (passwordRepeatValue === passwordValue) {
        setPasswordRepeatError(undefined);
        setIsPasswordRepeatError(false);
        setIsPasswordRepeatCheck(true);
      } else {
        setPasswordRepeatError('비밀번호가 일치하지 않습니다!');
        setIsPasswordRepeatError(true);
      }
    } else {
      setPasswordRepeatError(undefined);
      setIsPasswordRepeatError(false);
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUserType(event.target.id);
  };

  const handleLoginSystem = async () => {
    if (isEmailCheck && isPasswordCheck && isPasswordRepeatCheck) {
      try {
        const data = await authenticationAPI.post({
          email: emailValue,
          password: passwordValue,
        });
        localStorage.setItem('token', data.data.item.token);
        localStorage.setItem('user', data.data.item.user.item.type);
        setModalContent('회원가입 성공!');
        setTimeout(() => {
          router.push('/noticeList');
        }, 1000);
      } catch (error) {
        console.error('로그인 실패:', (error as ErrorType).response?.status);
        setIsOpen(true);
        setModalContent('로그인 정보가 잘못되었습니다!');
        setEmailError('이메일이 맞는지 확인해주세요!');
        setIsEmailError(true);
        setPasswordError('비밀번호가 맞는지 확인해주세요!');
        setIsPasswordError(true);
      }
    } else {
      setIsOpen(true);
      setModalContent('값을 제대로 입력해주세요!');
      if (emailValue === '') {
        setEmailError('이메일 칸이 비어있습니다!');
        setIsEmailError(true);
      }
      if (passwordValue === '') {
        setPasswordError('비밀번호 칸이 비어있습니다!');
        setIsPasswordError(true);
      }
    }
  };

  const handleRegistSystem = async () => {
    if (isEmailCheck && isPasswordCheck && isPasswordRepeatCheck) {
      try {
        const data = await userAPI.post({
          email: emailValue,
          password: passwordValue,
          type: selectedUserType,
        });
        if (data.data.item.id) {
          setIsOpen(true);
          setModalContent('회원가입 성공!');
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        }
      } catch (error) {
        console.error('회원 가입:', (error as ErrorType).response?.status);
        if ((error as ErrorType).response?.status === 409) {
          setIsOpen(true);
          setModalContent('중복된 이메일입니다!');
          setEmailError('중복된 이메일입니다!');
          setIsEmailError(true);
        }
      }
    } else {
      setIsOpen(true);
      setModalContent('값을 제대로 입력해주세요!');
      if (emailValue === '') {
        setEmailError('이메일 칸이 비어있습니다!');
        setIsEmailError(true);
      }
      if (passwordValue === '') {
        setPasswordError('비밀번호 칸이 비어있습니다!');
        setIsPasswordError(true);
      }
      if (passwordRepeatValue === '') {
        setPasswordRepeatError('비밀번호 확인칸이 비어있습니다!');
        setIsPasswordRepeatError(true);
      }
    }
  };

  useEffect(() => {
    CheckEmail();
    CheckPassword();
    CheckPasswordRepeat();
  }, [emailValue, passwordValue, passwordRepeatValue]);

  return {
    isOpen,
    modalType,
    modalContent,
    setIsOpen,
    closeModal,
    emailError,
    passwordError,
    passwordRepeatError,
    isEmailError,
    isPasswordError,
    isPasswordRepeatError,
    selectedUserType,
    handleRadioChange,
    handleLoginSystem,
    handleRegistSystem,
  };
}
