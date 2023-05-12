import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { useEffect } from "react";
import { axiosClient } from "../../utils/axiosInstance";

export default () => {
  const router = useRouter();
  const { mutate } = useMutation({
    mutationFn: async () => {
      return await axiosClient.post("users/signout", {});
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  useEffect(() => {
    mutate();
  }, []);

  return <div>Signing you out ...</div>;
};
