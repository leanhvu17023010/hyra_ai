import * as yup from 'yup';


export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required("Vui lòng nhập tên hiển thị"),
  email: yup
    .string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
  agree: yup
    .boolean()
    .oneOf([true], "Bạn cần đồng ý điều khoản")
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
});

export const forgotSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email")
});


export const validate = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};
