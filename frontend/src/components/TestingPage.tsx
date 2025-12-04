import TableEditor from "./editors/TableEditor";
import PingServer from "./PingServer";
import Article from "./Article";

function TestingPage() {
	return (
		<>
			<p>TESTING PAGE FOR COMPONENTS</p>
			<PingServer />
			<br />
			<TableEditor></TableEditor>
			<br />
			<hr />
			<h2>Article Component Test</h2>
			<Article
				title="Sample Wiki Article"
				markdown={[
					"# Introduction\n\nThis is a **test** article with _markdown_ formatting.",
					"## Features\n\n- Supports **bold** and _italic_\n- ~~Strikethrough~~ text\n- Lists and tables\n- Code blocks",
					"### Code Example\n\n```javascript\nconst greeting = 'Hello World!';\nconsole.log(greeting);\n```",
					"### Table Example\n\n| Feature | Supported |\n|---------|----------|\n| Bold | ✓ |\n| Tables | ✓ |\n| Code | ✓ |",
					"## Links\n\nCheck out [GitHub](https://github.com) for more!"
				]}
				onEdit={() => alert("Edit button clicked!")}
				editHref="/edit"
				className="article-test-container"
			/>
		</>
	);
}

export default TestingPage;
