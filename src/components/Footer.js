import React, { useState, useEffect } from "react";

const Footer = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString();
      setTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-footColor">
      <div className="text-right font-bold text-black text-xl">{time}</div>
    </footer>
  );
};

export default Footer;
