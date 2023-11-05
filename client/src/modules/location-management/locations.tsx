import {
  Button,
  CustomFlowbiteTheme,
  Pagination,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import { GlobalStateContext } from "../../configs/global-state-provider";
import CreateButton from "../../shared/layout/buttons/create-button";
import EditButton from "../../shared/layout/buttons/edit-button";
import { ICompanyLocation } from "../../shared/model/company.model";
import { getAllLocations } from "../../shared/api/location.api";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

const LocationsPage = () => {
  const logged_in_user =
    React.useContext(GlobalStateContext)?.globalState?.user;
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = React.useState<number>(() => {
    const cp = history.state["currentPage"];
    if (!cp) return 1;
    return cp;
  });
  const [sizePerPage, setSizePerPage] = React.useState<number>(() => {
    const sp = history.state["sizePerPage"];
    if (!sp) return 10;
    return sp;
  });
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState(() => {
    const st = history.state["searchTerm"];
    if (!st) return "";
    return st;
  });
  const [locationList, setLocationList] = React.useState<ICompanyLocation[]>(
    []
  );

  const generateBody = () => {
    if (locationList.length === 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={3} className="text-center">
            No locations found
          </Table.Cell>
        </Table.Row>
      );
    }

    return locationList.map((loc, idx) => (
      <Table.Row key={idx}>
        <Table.Cell>{loc.name}</Table.Cell>
        <Table.Cell>{loc.address}</Table.Cell>
        <Table.Cell>
          <div className="flex gap-2 justify-center">
            {/* <Button
              size="sm"
              onClick={() =>
                navigate(`./${PATHS.VIEW_LOCATION}/${loc.id}`)
              }
            >
              View
            </Button> */}
            <EditButton
              size="sm"
              onClick={() => {
                navigate(`./${PATHS.EDIT_LOCATION}/${loc.id}`);
              }}
            />
          </div>
        </Table.Cell>
      </Table.Row>
    ));
  };

  React.useEffect(() => {
    Promise.all([
      getAllLocations(
        logged_in_user?.company_id || 0,
        currentPage,
        sizePerPage
      ).then((res) => {
        setLocationList(res.data);
        setTotalPages(res.totalPages);
      }),
    ]).finally(() => {
      setLoading((prev) => false);
    });
  }, []);

  React.useEffect(() => {
    if (searchTerm === "") {
      setLoading((prev) => true);
      getAllLocations(logged_in_user?.company_id || 0, currentPage, sizePerPage)
        .then((res) => {
          setLocationList(res.data);
          setTotalPages(res.totalPages);
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    } else {
      setLoading((prev) => true);
      getAllLocations(
        logged_in_user?.company_id || 0,
        currentPage,
        sizePerPage,
        undefined,
        searchTerm ? `contains(department_name,${searchTerm})` : undefined
      )
        .then((res) => {
          setLocationList(res.data);
          setTotalPages(res.totalPages);
          setCurrentPage((prev) => 1);
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    }
    history.replaceState({ searchTerm, currentPage, sizePerPage }, "");
  }, [currentPage, sizePerPage, searchTerm]);

  return (
    <div id="location-main">
      <p className="header">Locations</p>
      <div className="flex justify-between">
        <TextInput
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
        <CreateButton
          size="sm"
          onClick={() => {
            navigate(`./${PATHS.ADD_LOCATION}`);
          }}
          value={"Add Location"}
        />
      </div>
      <div id="location-section" className="mt-4 overflow-x-auto">
        <Table theme={customTableTheme}>
          <Table.Head>
            <Table.HeadCell>Location</Table.HeadCell>
            <Table.HeadCell>Address</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={3} className="text-center">
                  <Spinner size="xl" />
                </Table.Cell>
              </Table.Row>
            ) : (
              generateBody()
            )}
          </Table.Body>
        </Table>
      </div>
      {/* <div className="text-center mt-4">
      <label>
        {filteredEmployees.length === 0
          ? `Showing ${startIndex}  to ${Math.min(
            endIndex,
            filteredEmployees.length
          )} of ${filteredEmployees.length} Entries`
          : `Showing ${startIndex + 1}  to ${Math.min(
            endIndex,
            filteredEmployees.length
          )} of ${filteredEmployees.length} Entries`}
      </label>
    </div> */}
      <div className="flex mt-4 items-center justify-center text-center">
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

export default LocationsPage;
