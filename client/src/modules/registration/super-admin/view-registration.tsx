import { Button, Pagination, Spinner, Table } from "flowbite-react";
import React from "react";
import { IRegistration } from "../../../shared/model/company.model";
import { IApplicationCode } from "../../../shared/model/application.model";
import ApproveButton from "../../../shared/layout/buttons/approve-button";
import RejectButton from "../../../shared/layout/buttons/reject-button";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../configs/constants";
import { getAllRegistrations } from "../../../shared/api/registration.api";
import { getAllCodes } from "../../../shared/api/code.api";

const ViewRegistration = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sizePerPage, setSizePerPage] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const [registrationList, setRegistrationList] = React.useState<
    IRegistration[]
  >([]);
  const [codeList, setCodeList] = React.useState<IApplicationCode[]>([]);

  const navigate = useNavigate();

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
          <Table.Cell>{registration.company_name}</Table.Cell>
          <Table.Cell>{registration.industry}</Table.Cell>
          <Table.Cell>
            {codeList.find(
              (code) => Number(code.code) === registration.no_of_employees
            )?.description || registration.no_of_employees}
          </Table.Cell>
          <Table.Cell className="flex gap-2 justify-center">
            <Button size="sm" onClick={() => {
              navigate(`/registration/${PATHS.VIEW_REGISTRATION}`, {
                state: {
                  registration: registration,
                },
              });
            }}>View</Button>
            <ApproveButton size="sm" />
            <RejectButton size="sm" />
          </Table.Cell>
        </Table.Row>
      );
    });
  };

  React.useEffect(() => {
    Promise.all([
      getAllRegistrations(currentPage, sizePerPage)
      .then((res) => {
        setRegistrationList(res.data);
        setTotalPages(res.totalPages);
        setLoading((prev) => false);
      }),
      getAllCodes(undefined, undefined, undefined, "code_type(no_of_employees)")
      .then((res) => {
        setCodeList(res.data);
      }),
    ]);
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
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default ViewRegistration;
