import { Button, Pagination, Spinner, Table } from "flowbite-react";
import React from "react";
import { IApplicationCode } from "../../shared/model/application.model";
import CreateButton from "../../shared/layout/buttons/create-button";
import { useNavigate } from "react-router-dom";
import { CODE_STATUS, PATHS } from "../../configs/constants";
import EditButton from "../../shared/layout/buttons/edit-button";
import { createUpdateCodes, getAllCodes } from "../../shared/api/code.api";
import DeactivateButton from "../../shared/layout/buttons/deactivate-button";
import ActivateButton from "../../shared/layout/buttons/activate-button";
import { toast } from "react-toastify";

const ViewCode = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sizePerPage, setSizePerPage] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const [codeList, setCodeList] = React.useState<IApplicationCode[]>([]);
  const [actionLoading, setActionLoading] = React.useState<number[]>([]);

  const navigate = useNavigate();

  const updateStatus = (code: IApplicationCode, status: string) => {
    setActionLoading((prev) => [...prev, code.id]);
    createUpdateCodes({ ...code, status })
      .then((res) => {
        toast.success(
          `Code ${
            status === CODE_STATUS.ACTIVE ? "activated" : "deactivated"
          } successfully!`
        );
        setCodeList((prev) =>
          prev.map((c) => (c.id !== res.data.id ? c : res.data))
        );
      })
      .catch((err) => {
        toast.error(
          `Error ${
            status === CODE_STATUS.ACTIVE ? "activating" : "deactivating"
          } code`
        );
      })
      .finally(() => {
        setActionLoading((prev) => prev.filter((id) => id !== code.id));
      });
  };

  const generateBody = () => {
    if (codeList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={4} className="text-center">
            No codes found
          </Table.Cell>
        </Table.Row>
      );
    }

    return codeList.map((code, idx) => {
      return (
        <Table.Row key={idx}>
          <Table.Cell>{code.code_type}</Table.Cell>
          <Table.Cell>{code.code}</Table.Cell>
          <Table.Cell>{code.description}</Table.Cell>
          <Table.Cell className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={() => navigate(`./${PATHS.VIEW_CODE}/${code.id}`)}
            >
              View
            </Button>
            <EditButton
              size="sm"
              onClick={() => {
                navigate(`./${PATHS.EDIT_CODE}/${code.id}`);
              }}
            />
            {code.status === CODE_STATUS.ACTIVE ? (
              <DeactivateButton
                size="sm"
                disabled={
                  actionLoading.find((val) => val === code.id) !== undefined
                }
                isProcessing={
                  actionLoading.find((val) => val === code.id) !== undefined
                }
                onClick={() => updateStatus(code, CODE_STATUS.INACTIVE)}
              />
            ) : (
              <ActivateButton
                size="sm"
                disabled={
                  actionLoading.find((val) => val === code.id) !== undefined
                }
                isProcessing={
                  actionLoading.find((val) => val === code.id) !== undefined
                }
                onClick={() => updateStatus(code, CODE_STATUS.ACTIVE)}
              />
            )}
          </Table.Cell>
        </Table.Row>
      );
    });
  };

  React.useEffect(() => {
    getAllCodes(currentPage, sizePerPage, "asc(code_type)")
      .then((res) => {
        setCodeList(res.data);
        setTotalPages(res.totalPages);
      })
      .finally(() => {
        setLoading((prev) => false);
      });
  }, []);

  return (
    <div id="code-main">
      <p className="header">Codes</p>
      <div className="mb-4 flex justify-end">
        <CreateButton
          size="sm"
          onClick={() => {
            navigate(`./${PATHS.ADD_CODE}`);
          }}
        />
      </div>
      <Table striped>
        <Table.Head>
          <Table.HeadCell>Code Type</Table.HeadCell>
          <Table.HeadCell>Code</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
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

export default ViewCode;
