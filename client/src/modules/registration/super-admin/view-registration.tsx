import { Pagination, Table } from "flowbite-react";
import React from "react";
import { API_URL } from "../../../configs/constants";

const ViewRegistration = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sizePerPage, setSizePerPage] = React.useState(10);

  const registrationList = [];

  React.useEffect(() => {
    fetch(`${API_URL}/registration?size=${sizePerPage}&page=${currentPage}`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    }).then((res) => {
      res.json().then((data) => {
        console.log(data);
      });
    });
  }, []);

  return (
    <div id="registration-main">
      <p className="header">Registrations</p>
      <Table striped>
        <Table.Head>
          <Table.HeadCell>Company</Table.HeadCell>
          <Table.HeadCell>Industry</Table.HeadCell>
          <Table.HeadCell>No. of Employees</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body></Table.Body>
      </Table>
      <div className="flex mt-4 text-center justify-center items-center">
        <Pagination
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          showIcons
          totalPages={1}
        />
      </div>
    </div>
  );
};

export default ViewRegistration;
