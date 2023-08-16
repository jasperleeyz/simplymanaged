'use client';

import { Footer } from 'flowbite-react';

const DefaultFooter = () => {
  return (
    <Footer container>
      <div className='w-full mx-auto max-w-6xl md:flex md:items-center md:justify-between '>
      <Footer.Copyright
        by="SimplyManaged™"
        href="#"
        year={2023}
        className='mb-3 md:mb-0'
      />
      <Footer.LinkGroup className='block md:flex'>
        <Footer.Link href="#" className='mb-3 md:mb-0'>
          About
        </Footer.Link>
        <Footer.Link href="#" className='mb-3 md:mb-0'>
          Privacy Policy
        </Footer.Link>
        <Footer.Link href="#" className='mb-3 md:mb-0'>
          Licensing
        </Footer.Link>
        <Footer.Link href="#" >
          Contact
        </Footer.Link>
      </Footer.LinkGroup>
      </div>
    </Footer>
  )
}

export default DefaultFooter