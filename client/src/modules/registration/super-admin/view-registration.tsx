import { Pagination, Spinner, Table } from "flowbite-react";
import React from "react";
import { API_URL } from "../../../configs/constants";

const ViewRegistration = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sizePerPage, setSizePerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(true);

  const registrationList = [] as any[];

  const generateBody = () => {
    if (registrationList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={4} className="text-center">
            No registrations found
          </Table.Cell>
        </Table.Row>
      );
    }

    return registrationList.map((registration, idx) => {
      return (
        <Table.Row key={idx}>
          <Table.Cell>{registration.company}</Table.Cell>
          <Table.Cell>{registration.industry}</Table.Cell>
          <Table.Cell>{registration.noOfEmployees}</Table.Cell>
          <Table.Cell>
            <div className="flex">
              <button className="btn btn-sm btn-primary">View</button>
            </div>
          </Table.Cell>
        </Table.Row>
      );
    });
  };

  React.useEffect(() => {
    fetch(`${API_URL}/registration?size=${sizePerPage}&page=${currentPage}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }).then((res) => {
      res.json().then((data) => {
        console.log(data);
      });
      setLoading(prev => false);
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
        <Table.Body>
          {loading ? (
            <Table.Row>
              <Table.Cell colSpan={4} className="text-center">
                <Spinner size="xl" />
              </Table.Cell>
            </Table.Row>
          ) : (
            generateBody()
          )}
        </Table.Body>
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
