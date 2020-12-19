import React from "react";
import { Scan } from "../../shared/types"
import { FaExchangeAlt, FaClipboardCheck, FaFilePdf } from 'react-icons/fa';
import { Card, Collapse } from 'react-bootstrap';
import { DiffButton } from "./Room";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";


type scanCardProps = {
    value: Scan,
    index: number,
    monitorUrl: string,
    onToggle: (id: number) => void,
    onModalOpen: (url: string) => void
}


export function ScanCard({ value, index, monitorUrl, onToggle, onModalOpen }: scanCardProps) {

    const changeDetect = (scan: Scan) => {
        return ((scan.changed_files && scan.changed_files.length) ||
            (scan.new_files && scan.new_files.length) ||
            (scan.deleted_files && scan.deleted_files.length) ||
            scan.isDiffrence)
    };

    const handlePDF = (id: string, date: string, url: string) => {
        const div = document.getElementById(id);
        if (div) {
            html2canvas(div).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();

                pdf.setFontSize(25);
                pdf.setFont("times", "bold");
                pdf.text(10, 20, monitorUrl)

                pdf.setFontSize(10);
                pdf.text(10, 30, date)

                if (url !== 'noPath') {
                    pdf.text(`Link to HTML comparsion:`, 10, 50);
                    pdf.setTextColor(52, 29, 145);
                    pdf.text(url, 10, 54);
                }

                pdf.addImage(imgData, 'PNG', 10, 60);
                pdf.save(`scan-${date.slice(5, -3)}.pdf`);
            });
        }
    }

    return (
        <div id='cardsWrapper'>
            <Card>
                <Card.Header
                    onClick={() => onToggle(value.id)}
                    aria-controls="example-collapse-text"
                    aria-expanded={value.isOpen}>
                    <div className="header">
                        {changeDetect(value) ?
                            <FaExchangeAlt style={{ color: 'green', marginRight:'5px'}}></FaExchangeAlt>
                            : <FaClipboardCheck></FaClipboardCheck>
                        }
                        <p>{value.date}</p>
                    </div>
                </Card.Header>
                <Collapse in={value.isOpen}>
                    <Card.Body >
                        <Card.Text id="example-collapse-text">
                            <div className="h2-wrapper">
                                <h2>Monitor Raport</h2>
                            </div>
                            <div id={`pdf-${index}`}>

                                <div className="body">
                                    <div className="title">
                                        <b>Files changes</b>
                                    </div>
                                    {value.new_files && value.new_files.map((name) => (<p className="new">+ {name}</p>))}
                                    {value.changed_files && value.changed_files.map((name) => (<p className="modified">~ {name}</p>))}
                                    {value.deleted_files && value.deleted_files.map((name) => (<p className="deleted">- {name}</p>))}
                                </div>

                                <div className="body">
                                    <div className="title">
                                        <b>Key words occurences</b>
                                    </div>
                                    {value.keyWordsOccuranceList && value.keyWordsOccuranceList.map((name) => {
                                        return (
                                            <React.Fragment>
                                                <p className="key-word"> {name[0]}</p>
                                                {name.slice(1).map((line) => {
                                                    const lineNumber = line.split(" ").splice(-1)[0]
                                                    const lastIndex = line.lastIndexOf(" ");
                                                    const lineCut = line.substring(0, lastIndex);
                                                    return (
                                                        <span>
                                                            <i>
                                                                {lineNumber}
                                                            </i>
                                                            <p className="modified">{lineCut}</p>
                                                        </span>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="body">
                                <div className="title">
                                    <b>Text changes</b>
                                </div>
                                {
                                    value.isDiffrence > 0 && (
                                        <div className="buttons">
                                            <DiffButton onClick={() => onModalOpen(value.raportPath)}>Check out text difference</DiffButton>
                                            <DiffButton onClick={() => handlePDF(`pdf-${index}`, value.date, value.raportPath)}>Generate PDF <FaFilePdf></FaFilePdf></DiffButton>
                                        </div>
                                    )
                                }

                            </div>
                        </Card.Text>
                    </Card.Body>
                </Collapse>
            </Card>
        </div>
    )
}