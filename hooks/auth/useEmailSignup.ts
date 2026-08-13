import { emailSignupApi, sendEmailVerificationCodeApi, verifyEmailCodeApi } from "@/api/authApi";
import { EmailSignupRequest, SendEmailVerificationCodeRequest, VerifyEmailCodeRequest } from "@/types/authType";
import { useMutation } from "@tanstack/react-query";

export const useEmailSignup = () => {
  const { mutate: signup, isPending, error, } = useMutation({ 
    mutationFn: (data: EmailSignupRequest) => 
      emailSignupApi(data),
  });
  
  return {
    signup,
    isPending,
    error,
  };
};

export const useSendEmailVerificationCode = () => {
    const {
      mutate: sendEmailVerificationCode,
      isPending,
      error,
      isError,
    } = useMutation({
      mutationFn: (data: SendEmailVerificationCodeRequest) =>
        sendEmailVerificationCodeApi(data),
    });
  
    return {
      sendEmailVerificationCode,
      isPending,
      error,
      isError,
    };
  };


  export const useVerifyEmailCode = () => {
    const {mutate: verifyEmailCode, isPending, error, isError,
    } = useMutation({
      mutationFn: (data: VerifyEmailCodeRequest) =>
        verifyEmailCodeApi(data),
    });
    return {
      verifyEmailCode,
      isPending,
      error,
      isError,
    };
  };

// 1. Send email verification code mutation
// 2. Verify email code mutation
// 3. Email signup mutation

// Send амжилттай
// → code input нээгдэнэ
// → 5 минутын timer эхэлнэ
// → resend 60 секунд disabled

// Verify амжилттай
// → emailVerificationToken хадгална
// → email input lock хийнэ
// → 인증 완료 харуулна

// Signup
// → token-ийг бусад form data-тай хамт явуулна