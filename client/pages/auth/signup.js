import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "react-query";
import { axiosClient } from "../../utils/axiosInstance";

const Signup = () => {
  const router = useRouter();
  const { mutate, isLoading, error, isError } = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosClient.post("users/signup", formData);
      return response.data;
    },
    onSuccess: () => {
      router.push("/");
    },
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnSubmitForm = (e) => {
    e.preventDefault();

    mutate({
      email,
      password,
    });
  };

  const errorHandler = (error) => {
    if (error.response) {
      return error.response.data.errors.map((er) => (
        <li key={er.field}>
          {er.field}: {er.message}{" "}
        </li>
      ));
    }
  };

  console.log(isLoading, isError, error);

  return (
    <form onSubmit={handleOnSubmitForm}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>
      <button disabled={isLoading} className="btn btn-primary" type="submit">
        Sign Up
      </button>
      {isError && (
        <div className="alert alert-danger">
          Opps...
          <ul className="my-0">{errorHandler(error)}</ul>
        </div>
      )}
    </form>
  );
};

export default Signup;
