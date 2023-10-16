import { CustomFlowbiteTheme } from "flowbite-react";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};
