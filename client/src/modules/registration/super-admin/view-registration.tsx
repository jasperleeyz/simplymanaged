import {
  Button,
  CustomFlowbiteTheme,
  Pagination,
  Spinner,
  Table,
} from "flowbite-react";
import React from "react";
import { IRegistration } from "../../../shared/model/company.model";
import { IApplicationCode } from "../../../shared/model/application.model";
import ApproveButton from "../../../shared/layout/buttons/approve-button";
import RejectButton from "../../../shared/layout/buttons/reject-button";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS, REGISTRATION_STATUS } from "../../../configs/constants";
import {
  getAllRegistrations,
  updateRegistration,
} from "../../../shared/api/registration.api";
import { getAllCodes } from "../../../shared/api/code.api";
import { toast } from "react-toastify";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const ViewRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = React.useState(
    location?.state?.page || 1
  );
  const [sizePerPage, setSizePerPage] = React.useState(
    location?.state?.sizePerPage || 10
  );
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const [registrationList, setRegistrationList] = React.useState<
    IRegistration[]
  >([]);
  const [codeList, setCodeList] = React.useState<IApplicationCode[]>([]);
  const [actionLoading, setActionLoading] = React.useState([]);

  const updateStatus = (req: IRegistration, status: string) => {
    updateRegistration({ ...req, approve_status: status })
      .then((res) => {
        toast.success(
          `Registration ${
            status === REGISTRATION_STATUS.APPROVED ? "approved" : "rejected"
          } successfully!`
        );
        setRegistrationList((prev) =>
          prev.map((reg) => (reg.id !== res.data.id ? reg : res.data))
        );
      })
      .catch((err) => {
        toast.error(
          `Error ${
            status === REGISTRATION_STATUS.APPROVED ? "approving" : "rejecting"
          } registration`
        );
      });
  };

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
            <Button
              size="sm"
              onClick={() => {
                navigate(
                  `/${PATHS.REGISTRATION}/${PATHS.VIEW_REGISTRATION}/${registration.id}`
                );
              }}
            >
              View
            </Button>
            {registration.approve_status === REGISTRATION_STATUS.PENDING && (
              <>
                <ApproveButton
                  size="sm"
                  onClick={() =>
                    updateStatus(registration, REGISTRATION_STATUS.APPROVED)
                  }
                />
                <RejectButton
                  size="sm"
                  onClick={() =>
                    updateStatus(registration, REGISTRATION_STATUS.REJECTED)
                  }
                />
              </>
            )}
          </Table.Cell>
        </Table.Row>
      );
    });
  };

  React.useEffect(() => {
    Promise.all([
      getAllRegistrations(currentPage, sizePerPage).then((res) => {
        setRegistrationList(res.data);
        setTotalPages(res.totalPages);
        setLoading((prev) => false);
      }),
      getAllCodes(
        undefined,
        undefined,
        undefined,
        "equals(code_type,no_of_employees)"
      ).then((res) => {
        setCodeList(res.data);
      }),
    ]);
  }, []);

  React.useEffect(() => {
    if (
      currentPage !== location?.state?.page ||
      sizePerPage !== location?.state?.sizePerPage
    ) {
      location.state = {
        ...location.state,
        page: currentPage,
        sizePerPage: sizePerPage,
      };
    }
  }, [currentPage, sizePerPage]);

  return (
    <div id="registration-main">
      <p className="header">Registrations</p>
      <div className="overflow-x-auto">
        <Table striped theme={customTableTheme}>
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
      </div>
      <div className="flex mt-4 text-center justify-center items-center">
        <Pagination
          currentPage={currentPage}
          layout="pagination"
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
