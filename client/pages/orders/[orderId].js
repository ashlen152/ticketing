import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import StripeCheckout from "react-stripe-checkout";
import { axiosClient } from "../../utils/axiosInstance";
import { errorHandler } from "../../utils/errorHandler";

const OrderShow = ({ order, currentUser }) => {
  const router = useRouter();
  const ticket = order.ticket;
  const [timeLeft, setTimeLeft] = useState("");

  const { mutate, error, isError } = useMutation({
    mutationFn: async ({ token }) => {
      const response = await axiosClient.post("payments", {
        orderId: order.id,
        token,
      });
      return response.data;
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(msLeft);
    };

    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [order]);

  return (
    <div>
      {timeLeft > 0 ? (
        <div>
          <h1>{ticket.title}</h1>
          <h4>Time left to pay: {Math.round(timeLeft / 1000)} seconds</h4>

          <h1>{order.status}</h1>
          <h4>{order.userId}</h4>
          <h4>{ticket.price}</h4>
          <StripeCheckout
            token={({ id }) => mutate({ token: id })}
            stripeKey="pk_test_51N5R2AJWKxoRSuaHYAoZYt25BhPS0US1lKN5aMRh5XmmFSBsdj8vvSu0jvcx38aWnqDIaN0MtN0mfGfawu6fC2V800fIPN37xe"
            amount={ticket.price * 100}
            email={currentUser.email}
          ></StripeCheckout>
        </div>
      ) : (
        <h4>The order expired</h4>
      )}
      {isError && errorHandler(error)}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
