import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { axiosClient } from "../../utils/axiosInstance";

const TicketShow = ({ ticket }) => {
  const router = useRouter();
  const { mutate, isLoading, error, isError } = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post("orders", {
        ticketId: ticket.id,
      });
      return response.data;
    },
    onSuccess: (order) => {
      router.push("/orders/[orderId]", `/orders/${order.id}`);
    },
  });
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
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {isError && (
        <div className="alert alert-danger">
          Opps...
          <ul className="my-0">{errorHandler(error)}</ul>
        </div>
      )}
      <button onClick={mutate} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;

  const { data } = await client.get(`tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
