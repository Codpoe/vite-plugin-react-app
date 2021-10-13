import IconSun from 'virtual:icons/tabler/sun';
import IconMoon from 'virtual:icons/tabler/moon';

export default function NotFound() {
  return (
    <div>
      <h1>root 404 page</h1>
      <p className="flex items-center">
        This icons:
        <IconSun className="text-rose-500" />
        <IconMoon className="text-indigo-500" />
      </p>
    </div>
  );
}
