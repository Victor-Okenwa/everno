"use client";

import { useParams } from "next/navigation";

export default function GroupLink() {
  const param = useParams();
  console.log(param);
  return (
   <section><div>
    {param.link}
    </div></section>
  );
}
