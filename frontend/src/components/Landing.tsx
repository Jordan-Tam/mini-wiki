import TableEditor from "../lecture_components/TableEditor";
import PingServer from "./PingServer";

function Landing() {
  return (
    <>
      <p>Landing</p>
      <PingServer />
	  <br/>
      <TableEditor></TableEditor>
    </>
  );

/*function Landing() {
	return (
		<>
			<p>Landing</p>
			<TableEditor></TableEditor>
		</>
	);
}*/

export default Landing;
