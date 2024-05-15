import { OrganizationSwitcher } from '@clerk/nextjs'

export default function Sidebar() {
  return (
    <OrganizationSwitcher
      hidePersonal={true}
    />
  );
};