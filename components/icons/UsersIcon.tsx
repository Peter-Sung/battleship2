import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.034 1.253-1.964 2.05-2.822m-2.05 2.822a7.5 7.5 0 0 0-7.5 0M10.5 18.75a7.5 7.5 0 1 1 7.5-7.5c0 4.142-3.358 7.5-7.5 7.5Z"
    />
  </svg>
);

export default UsersIcon;