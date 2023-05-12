import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "react-query";
import { axiosClient } from "../../utils/axiosInstance";

const NewTicket = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const { mutate, isLoading, error, isError } = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosClient.post("tickets", formData);
      return response.data;
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    mutate({
      title,
      price,
    });
  };

  const onBlur = (e) => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
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
  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        <button disabled={isLoading} type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      {isError && (
        <div className="alert alert-danger">
          Opps...
          <ul className="my-0">{errorHandler(error)}</ul>
        </div>
      )}
    </div>
  );
};

export default NewTicket;
