import Image from 'next/image';
import { SubdomainAccountData } from '@/types/subdomain-type';

export default function SubdomainNav({ 
  data 
}: { 
  data: Pick<SubdomainAccountData, 'logo' | 'logoWidth' | 'logoHeight'>
}) {
  return (
    <nav className="bg-white border-b border-gray-200 h-24">
      <div className="px-4 h-full flex items-center justify-center">
        <Image
          src={data.logo || '/default-logo.png'}
          alt="Logo"
          width={data.logoWidth || 130}
          height={data.logoHeight || 130}
          className="object-contain"
        />
      </div>
    </nav>
  );
}