import { useState, useEffect } from "react";
import API from "../../api"; 
import React from 'react';
const MapData = () => {
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    API.get("/detail/4") // Base URL already set in API instance
      .then((response) => {
        // if (response.data.length > 0) {
        //   setGroupName(response.data[0].groupName);
        // }
        console.log(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return <h2>Group Name: {groupName}</h2>;
};

export default MapData;
