import { useState, useRef } from "react";
import rehypeSanitize from "rehype-sanitize";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface CellPosition {
	rowIndex: number;
	colIndex: number;
	offsetInCell: number;
}

function TableEditor() {
	const initialTable = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;

	const [text, setText] = useState<string>(initialTable);
	const [currentCell, setCurrentCell] = useState<CellPosition>({
		rowIndex: 0,
		colIndex: 0,
		offsetInCell: 0
	});
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const rehypePlugins = [rehypeSanitize];

	// Update current cell based on cursor position
	const updateCurrentCellFromCursor = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const cursorPos = textarea.selectionStart;
		const textBeforeCursor = text.substring(0, cursorPos);
		const rowIndex = textBeforeCursor.split("\n").length - 1;
		const currentLine = text.split("\n")[rowIndex];
		if (!currentLine) return;
		const posInLine = cursorPos - textBeforeCursor.lastIndexOf("\n") - 1;
		// Find which column and offset within that column
		let colIndex = 0;
		// Start after first pipe
		let charCount = 1;
		const cells = currentLine.split("|").slice(1, -1);
		for (let i = 0; i < cells.length; i++) {
			const cellLength = cells[i].length;
			if (posInLine < charCount + cellLength) {
				colIndex = i;
				const offsetInCell = posInLine - charCount;
				setCurrentCell({ rowIndex, colIndex, offsetInCell });
				return;
			}
			// +1 for the pipe
			charCount += cellLength + 1;
		}
		setCurrentCell({ rowIndex, colIndex: cells.length - 1, offsetInCell: 0 });
	};

	// Parse the table to get rows and columns structure
	const parseTable = (tableText: string): string[][] => {
		const lines = tableText.split("\n").filter((line) => line.trim());
		return lines.map((line) => {
			// Remove leading/trailing pipes and split by pipe
			return line
				.trim()
				.split("|")
				.slice(1, -1)
				.map((cell) => cell.trim());
		});
	};

	// Convert parsed table back to markdown
	const tableToMarkdown = (rows: string[][]): string => {
		return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
	};

	// Calculate cursor position for a specific cell and offset
	const getCursorPosForCell = (
		newText: string,
		rowIndex: number,
		colIndex: number,
		offsetInCell: number
	): number => {
		const lines = newText.split("\n");
		if (rowIndex >= lines.length) return newText.length;
		const targetLine = lines[rowIndex];
		const cells = targetLine.split("|").slice(1, -1);
		if (colIndex >= cells.length) colIndex = cells.length - 1;
		// Calculate position: lines before + current line start + cells before + offset
		let lineStart =
			lines.slice(0, rowIndex).join("\n").length + (rowIndex > 0 ? 1 : 0);
		// Start after first pipe
		let cellStart = 1;
		for (let i = 0; i < colIndex; i++) {
			// +1 for pipe
			cellStart += cells[i].length + 1;
		}
		const maxOffset = cells[colIndex].length;
		const actualOffset = Math.min(offsetInCell, maxOffset);
		return lineStart + cellStart + actualOffset;
	};

	// Set cursor to a specific cell position
	const setCellPosition = (newText: string, cellPos: CellPosition) => {
		const newCursorPos = getCursorPosForCell(
			newText,
			cellPos.rowIndex,
			cellPos.colIndex,
			cellPos.offsetInCell
		);
		const textarea = textareaRef.current;
		if (!textarea) return;
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(newCursorPos, newCursorPos);
			// Update state after cursor is set
			setCurrentCell(cellPos);
		}, 0);
	};

	// Insert row above current position
	const insertRowAbove = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const rows = parseTable(text);
		if (rows.length === 0) return;
		const numCols = rows[0].length;
		const newRow = Array(numCols).fill("New Cell");
		rows.splice(currentCell.rowIndex, 0, newRow);
		const newText = tableToMarkdown(rows);
		// Cursor moves to same cell in the new row below (which is now rowIndex + 1)
		setText(newText);
		setCellPosition(newText, {
			rowIndex: currentCell.rowIndex + 1,
			colIndex: currentCell.colIndex,
			offsetInCell: currentCell.offsetInCell
		});
	};

	// Insert row below current position
	const insertRowBelow = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const rows = parseTable(text);
		if (rows.length === 0) return;
		const numCols = rows[0].length;
		const newRow = Array(numCols).fill("New Cell");
		rows.splice(currentCell.rowIndex + 1, 0, newRow);
		const newText = tableToMarkdown(rows);
		// Keep cursor at the same cell (row and column don't change)
		setText(newText);
		setCellPosition(newText, currentCell);
	};

	// Insert column to the left of current position
	const insertColumnLeft = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const rows = parseTable(text);
		if (rows.length === 0) return;
		rows.forEach((row, idx) => {
			const newCell = idx === 1 ? "----------" : "New";
			row.splice(currentCell.colIndex, 0, newCell);
		});
		const newText = tableToMarkdown(rows);
		// Cursor moves to same cell which is now at colIndex + 1
		setText(newText);
		setCellPosition(newText, {
			rowIndex: currentCell.rowIndex,
			colIndex: currentCell.colIndex + 1,
			offsetInCell: currentCell.offsetInCell
		});
	};

	// Insert column to the right of current position
	const insertColumnRight = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const rows = parseTable(text);
		if (rows.length === 0) return;
		rows.forEach((row, idx) => {
			const newCell = idx === 1 ? "----------" : "New";
			row.splice(currentCell.colIndex + 1, 0, newCell);
		});
		const newText = tableToMarkdown(rows);
		// Cursor stays in same cell (row and column indices don't change)
		setText(newText);
		setCellPosition(newText, currentCell);
	};

	// Add multiple rows at the end
	const addRowsAtEnd = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const input = prompt("How many rows to add (Max 100)?", "1");
		// User cancelled
		if (!input) return;
		const numRows = parseInt(input, 10);
		// Validate input
		if (isNaN(numRows) || numRows <= 0) {
			alert("Please enter a valid positive number.");
			return;
		}
		// Prevent excessive rows (performance protection)
		if (numRows > 100) {
			alert("Maximum 100 rows can be added at once.");
			return;
		}
		const rows = parseTable(text);
		if (rows.length === 0) return;
		const numCols = rows[0].length;
		for (let i = 0; i < numRows; i++) {
			rows.push(Array(numCols).fill("New Cell"));
		}
		const newText = tableToMarkdown(rows);
		// Keep cursor at same cell position
		setText(newText);
		setCellPosition(newText, currentCell);
	};

	// Add multiple columns at the end
	const addColumnsAtEnd = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const input = prompt("How many columns to add (Max 50)?", "1");
		// User cancelled
		if (!input) return;
		const numCols = parseInt(input, 10);
		// Validate input
		if (isNaN(numCols) || numCols <= 0) {
			alert("Please enter a valid positive number.");
			return;
		}
		// Prevent excessive columns (performance protection)
		if (numCols > 50) {
			alert("Maximum 50 columns can be added at once.");
			return;
		}
		const rows = parseTable(text);
		if (rows.length === 0) return;
		rows.forEach((row, idx) => {
			for (let i = 0; i < numCols; i++) {
				const newCell = idx === 1 ? "----------" : "New";
				row.push(newCell);
			}
		});
		const newText = tableToMarkdown(rows);
		// Keep cursor at same cell position
		setText(newText);
		setCellPosition(newText, currentCell);
	};

	return (
		<div className="tableEditor">
			<div className="userSide">
				<div className="toolbar">
					<button onClick={insertRowAbove}>Insert Row Above</button>
					<button onClick={insertRowBelow}>Insert Row Below</button>
					<button onClick={insertColumnLeft}>Insert Column Left</button>
					<button onClick={insertColumnRight}>Insert Column Right</button>
					<button onClick={addRowsAtEnd}>Add Rows (Bulk)</button>
					<button onClick={addColumnsAtEnd}>Add Columns (Bulk)</button>
				</div>
				<textarea
					ref={textareaRef}
					name="userTextArea"
					id="userInputArea"
					value={text}
					rows={10}
					cols={20}
					onChange={(e) => setText(e.target.value)}
					onClick={updateCurrentCellFromCursor}
					onKeyUp={updateCurrentCellFromCursor}
				></textarea>
			</div>
			<div className="previewArea">
				<MarkdownPreview source={text} rehypePlugins={rehypePlugins} />
			</div>
		</div>
	);
}

export default TableEditor;
