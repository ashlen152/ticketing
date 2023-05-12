import "bootstrap/dist/css/bootstrap.css";
import { QueryClient, QueryClientProvider } from "react-query";
import Header from "../components/header";
import buildClient from "../utils/axiosInstance";

const queryClient = new QueryClient();

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </QueryClientProvider>
  );
};

AppComponent.getInitialProps = async (context) => {
  const axios = buildClient(context.ctx);
  const { data } = await axios.get("users/currentuser");

  let pageProps = {};
  if (context.Component.getInitialProps) {
    pageProps = await context.Component.getInitialProps(
      context.ctx,
      axios,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
