import { useNavigate } from "react-router-dom";

export function useAppNavigate() {
  const navigate = useNavigate();

  return (path: string) => {
    if (path.startsWith("/")) {
      navigate(path); // absolute Pfade bleiben wie sie sind
    } else {
      navigate(`/home/${path}`);
    }
  };
}
