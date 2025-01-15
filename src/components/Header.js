import React, { useEffect, useState } from "react";

const Header = ({ title }) => {
  const [date, setDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = now.toLocaleDateString("es-ES", options);
    setDate(formattedDate);
  }, []);

  return (
    <header className="bg-greyColor p-4">
      <div className="flex justify-between items-center">
        <button onClick={() => (window.location.href = "/")}>
          <p className="font-lobsterTwo text-letterColor font-extrabold text-5xl">{title}</p>
        </button>
        <p className="font-lobsterTwo font-semibold text-letterColor text-2xl">{date}</p>
      </div>
    </header>
  );
};

export default Header;
